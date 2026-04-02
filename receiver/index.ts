import { SerialPort } from "serialport";

const RACEBOX_PATH = "/dev/rfcomm0";
const BAUD_RATE = 115200;

const port = new SerialPort({
    path: RACEBOX_PATH,
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