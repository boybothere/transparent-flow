const axios = require('axios');

// --- SETTINGS ---
// We connect to localhost:3001 directly. No ngrok!
const API_ENDPOINT = 'http://localhost:3001/api/iot-ping';
const SEND_INTERVAL_MS = 10000; // 10 seconds

// --- The Data to Send ---
const payload = {
    apiKey: "SECRET_KEY_FOR_D1",
    projectId: "P-101",
    milestoneId: "MS-GOOD",
    deviceId: "D-1"
};

let currentLat = 19.0760;

async function sendGpsPing() {
    currentLat += 0.0001;
    const currentLng = 72.8777;

    const fullPayload = {
        ...payload,
        iotPayload: {
            status: "DELIVERED_OK",
            location: [currentLat, currentLng]
        }
    };

    console.log(`🛰️  [GPS SIMULATOR] Sending ping for ${fullPayload.projectId}: ${fullPayload.iotPayload.location}`);

    try {
        const response = await axios.post(API_ENDPOINT, fullPayload);

        if (response.status === 201) {
            console.log(`✅  [GPS SIMULATOR] Ping SUCCESS. Server responded.`);
        } else {
            console.log(`❌  [GPS SIMULATOR] Ping FAILED. Server responded with: ${response.status}`);
        }

    } catch (error) {
        console.error(`❌  [GPS SIMULATOR] Ping FAILED: ${error.message}`);
    }
}

console.log("==============================");
console.log("LOCAL GPS SIMULATOR IS RUNNING.");
console.log("==============================");

setInterval(sendGpsPing, SEND_INTERVAL_MS);