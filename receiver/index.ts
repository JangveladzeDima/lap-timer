import {execSync} from "child_process";
import {SerialPort} from "serialport";

const RACEBOX_MAC = "DB:AB:63:98:62:F1";
const RFCOMM_DEVICE = "/dev/rfcomm0";
const BAUD_RATE = 115200;

function runCmd(cmd: string) {
    try {
        const output = execSync(cmd, {stdio: "pipe"}).toString();
        console.log(output);
    } catch (err: any) {
        console.error(`Command failed: ${cmd}`);
        console.error(err.stdout?.toString() || err.message);
    }
}

function setupRaceBox() {
    console.log("🔹 Removing old pairing...");
    runCmd(`bluetoothctl remove ${RACEBOX_MAC}`);

    console.log("🔹 Scanning and pairing...");
    runCmd(`bluetoothctl pair ${RACEBOX_MAC}`);
    runCmd(`bluetoothctl trust ${RACEBOX_MAC}`);
    runCmd(`bluetoothctl connect ${RACEBOX_MAC}`);

    console.log("🔹 Binding RFCOMM...");
    runCmd(`sudo rfcomm release ${RFCOMM_DEVICE}`);
    runCmd(`sudo rfcomm bind ${RFCOMM_DEVICE} ${RACEBOX_MAC} 1`);
    runCmd(`sudo chmod 666 ${RFCOMM_DEVICE}`);
}

function connectSerial() {
    const port = new SerialPort({
        path: RFCOMM_DEVICE,
        baudRate: BAUD_RATE,
        autoOpen: false,
    });

    port.open((err) => {
        if (err) {
            console.error("Failed to connect to RaceBox:", err.message);
            return;
        }
        console.log("✅ Connected to RaceBox via Bluetooth serial!");
    });

    port.on("data", (data: Buffer) => {
        console.log("RAW DATA:", data);
    });

    port.on("error", (err) => {
        console.error("Serial port error:", err.message);
    });
}

async function main() {
    setupRaceBox();
    // Wait a moment for binding to finish
    setTimeout(connectSerial, 3000);
}

main();