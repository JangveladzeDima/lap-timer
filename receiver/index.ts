import { execSync } from "child_process";

const RACEBOX_MAC = "DB:AB:63:98:62:F1";

function runCmd(cmd: string) {
    try {
        const output = execSync(cmd, { stdio: "pipe" }).toString();
        console.log(output);
        return output;
    } catch (err: any) {
        console.error(`Command failed: ${cmd}`);
        console.error(err.stdout?.toString() || err.message);
        return "";
    }
}

function scanAndWait(mac: string, timeout = 10000) {
    console.log("🔹 Scanning for RaceBox...");
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const result = runCmd("bluetoothctl scan on");
        if (result.includes(mac)) {
            console.log("✅ RaceBox discovered!");
            runCmd("bluetoothctl scan off");
            return true;
        }
    }
    console.log("❌ RaceBox not found in scan window");
    runCmd("bluetoothctl scan off");
    return false;
}

function setupRaceBox() {
    runCmd(`bluetoothctl remove ${RACEBOX_MAC}`);

    if (!scanAndWait(RACEBOX_MAC)) return false;

    runCmd(`bluetoothctl pair ${RACEBOX_MAC}`);
    runCmd(`bluetoothctl trust ${RACEBOX_MAC}`);
    runCmd(`bluetoothctl connect ${RACEBOX_MAC}`);

    runCmd(`sudo rfcomm release /dev/rfcomm0`);
    runCmd(`sudo rfcomm bind /dev/rfcomm0 ${RACEBOX_MAC} 1`);
    runCmd(`sudo chmod 666 /dev/rfcomm0`);

    return true;
}