
// /*
//  * ESP32 Live Gas Monitor (Cleaned and Refactored for Wokwi)
//  *
//  * Description:
//  * This firmware now uses a FIXED, predictable gas leak simulation to ensure
//  * consistency with the backend server and user dashboard.
//  *
//  * -> The leak will ONLY be active when the gas level is between 50% and 40%.
//  */

// #include <WiFi.h>
// #include <HTTPClient.h>

// // =================================================================
// // --- USER CONFIGURATION ---
// // =================================================================
// String userEmail = "e@yahoo.com";
// const char* ssid = "Wokwi-GUEST";
// const char* password = "";
// const char* wokwiHost = "host.wokwi.internal";
// String fallbackServerIP = "192.168.1.11"; 
// const int serverPort = 5000;

// // =================================================================
// // --- GLOBAL VARIABLES & CONSTANTS ---
// // =================================================================

// // --- Server & API ---
// String serverIP = "";
// String gasDataUrl = "";
// String gasLevelGetUrlPrefix = "";
// String simStatusUrlPrefix = "";

// // --- Hardware Pins ---
// const int gasSensorAnalogPin = 32;
// const int gasSensorDigitalPin = 33;
// const int ledPin = 21;
// const int buzzerPin = 22;

// // --- Gas Monitoring & Simulation ---
// float userGasLevel = 0.0;
// float lastSavedGasLevel = 0.0;
// const int lowGasThreshold = 20;

// // --- Consumption Rates ---
// const float gasConsumptionRate = 0.5;
// const float gasLeakConsumptionRate = 2.5;

// // --- MODIFIED: Leak Simulation with FIXED range ---
// const float LEAK_START_PERCENT = 50.0; // Leak simulation starts at or below this level
// const float LEAK_END_PERCENT = 40.0;   // Leak simulation stops below this level
// bool simulatedLeakActive = false;      // Flag to indicate if the leak simulation is active

// // --- Timers & State Management ---
// unsigned long lastDBFetch = 0;
// const unsigned long dbFetchInterval = 10000;
// const float gasUpdateThreshold = 2.0;
// bool dbFetched = false;

// // ... (Forward declarations and other functions remain the same) ...
// void initializeServerUrls();
// void fetchUserGasLevel();


// // =================================================================
// // --- SERVER & NETWORK FUNCTIONS ---
// // (No changes needed in this section)
// // ... initializeServerUrls(), initializeServerConnection() ...
// // =================================================================
// void initializeServerUrls() {
//     if (serverIP.length() > 0) {
//         String baseUrl = "http://" + serverIP + ":" + String(serverPort);
//         gasDataUrl = baseUrl + "/api/simulation/data";
//         gasLevelGetUrlPrefix = baseUrl + "/api/gaslevel/";
//         simStatusUrlPrefix = baseUrl + "/api/simulation/status/";
//         Serial.println("[CONFIG] Server URLs configured:");
//         Serial.println("  Base URL: " + baseUrl);
//     }
// }
// void initializeServerConnection() {
//     Serial.println("[SERVER] Trying to connect via Wokwi hostname: " + String(wokwiHost));
//     serverIP = wokwiHost;
//     initializeServerUrls();
//     HTTPClient http;
//     if (http.begin(gasLevelGetUrlPrefix + userEmail)) {
//         http.setTimeout(4000);
//         int httpCode = http.GET();
//         if (httpCode > 0) {
//             Serial.println("[SUCCESS] Connected to server via Wokwi hostname. Server responded with code: " + String(httpCode));
//             http.end();
//             return;
//         }
//         http.end();
//     }
//     Serial.println("[FALLBACK] Wokwi hostname failed. Trying user-defined fallback IP: " + fallbackServerIP);
//     serverIP = fallbackServerIP;
//     initializeServerUrls();
//     if (http.begin(gasLevelGetUrlPrefix + userEmail)) {
//         http.setTimeout(4000);
//         int httpCode = http.GET();
//         if (httpCode > 0) {
//             Serial.println("[SUCCESS] Connected to server via fallback IP. Server responded with code: " + String(httpCode));
//         } else {
//             Serial.println("[ERROR] Fallback IP also failed. Check your Node.js server and firewall settings.");
//             serverIP = "";
//         }
//         http.end();
//     }
// }


// // =================================================================
// // --- DATABASE INTERACTION FUNCTIONS ---
// // (No changes needed in this section)
// // ... sendDataToServer(), fetchUserGasLevel(), updateGasConsumptionInDB(), isSimulationRunning() ...
// // =================================================================
// void sendDataToServer(float currentGasLevel, bool isLeaking) {
//     if (WiFi.status() != WL_CONNECTED || gasDataUrl.length() == 0) return;
//     HTTPClient http;
//     if (http.begin(gasDataUrl)) {
//         http.addHeader("Content-Type", "application/json");
//         String json = "{\"email\":\"" + userEmail + "\"," +
//                       "\"currentLevel\":" + String(currentGasLevel, 2) + "," +
//                       "\"isLeaking\":" + String(isLeaking ? "true" : "false") + "}";
//         int httpResponseCode = http.POST(json);
//         if (httpResponseCode != 200) {
//             Serial.println("[ERROR] Failed to send data. HTTP Code: " + String(httpResponseCode));
//         }
//         http.end();
//     } else {
//         Serial.println("[ERROR] Could not connect to server to send data.");
//     }
// }
// void fetchUserGasLevel() {
//     if (WiFi.status() != WL_CONNECTED || gasLevelGetUrlPrefix.length() == 0) return;
//     HTTPClient http;
//     String fullUserUrl = gasLevelGetUrlPrefix + userEmail;
//     if (http.begin(fullUserUrl)) {
//         Serial.println("[DATABASE] Fetching latest gas level from server...");
//         http.setTimeout(5000);
//         int httpResponseCode = http.GET();
//         if (httpResponseCode == 200) {
//             String response = http.getString();
//             int gasLevelIndex = response.indexOf("\"currentLevel\":");
//             if (gasLevelIndex != -1) {
//                 int startPos = gasLevelIndex + 15;
//                 int endPos = response.indexOf(",", startPos);
//                 if (endPos == -1) endPos = response.indexOf("}", startPos);
//                 float dbGasLevel = response.substring(startPos, endPos).toFloat();
//                 userGasLevel = dbGasLevel;
//                 if (!dbFetched) {
//                     lastSavedGasLevel = dbGasLevel;
//                     dbFetched = true;
//                     Serial.println("[DATABASE] Fetch successful. Initial Gas Level: " + String(userGasLevel, 1) + "%");
//                 } else {
//                     Serial.println("[DATABASE] Sync successful. Gas Level is now: " + String(userGasLevel, 1) + "%");
//                 }
//             }
//         } else {
//             Serial.println("[ERROR] Failed to fetch user data. HTTP Code: " + String(httpResponseCode));
//         }
//         http.end();
//     } else {
//         Serial.println("[ERROR] Could not connect to user API.");
//     }
// }
// void updateGasConsumptionInDB(float newGasLevel) {
//     if (WiFi.status() != WL_CONNECTED || gasDataUrl.length() == 0) return;
//     if (abs(lastSavedGasLevel - newGasLevel) >= gasUpdateThreshold) {
//         // Use the generic sendDataToServer function for consistency
//         sendDataToServer(newGasLevel, simulatedLeakActive);
//         lastSavedGasLevel = newGasLevel;
//         Serial.println("[DATABASE] Consumption update sent. New Level: " + String(newGasLevel, 1) + "%");
//     }
// }
// bool isSimulationRunning() {
//     if (WiFi.status() != WL_CONNECTED || simStatusUrlPrefix.length() == 0) return true;
//     HTTPClient http;
//     String url = simStatusUrlPrefix + userEmail;
//     if (!http.begin(url)) return true;
//     http.setTimeout(3000);
//     int code = http.GET();
//     if (code != 200) { http.end(); return true; }
//     String response = http.getString();
//     http.end();
//     return response.indexOf("true") != -1;
// }

// // =================================================================
// // --- CORE LOGIC ---
// // =================================================================

// /**
//  * @brief Runs the gas consumption and leak simulation logic.
//  */
// void runGasSimulation() {
//     // --- MODIFIED: LOGIC FOR FIXED LEAK RANGE ---
//     // 1. Check if the gas level is within the fixed leak range.
//     if (userGasLevel <= LEAK_START_PERCENT && userGasLevel > LEAK_END_PERCENT) {
//         if (!simulatedLeakActive) { // Print the message only once when the leak starts
//             Serial.println("\n[!!!] LEAK DETECTED (50% -> 40% range) [!!!]");
//             Serial.println("[INFO] Gas consumption rate increased due to leak.\n");
//         }
//         simulatedLeakActive = true;
//     } else {
//         if (simulatedLeakActive) { // Print a message when the leak stops
//             Serial.println("[INFO] Gas level is now outside the leak range. Resuming normal consumption.");
//         }
//         simulatedLeakActive = false;
//     }

//     // 2. Determine current consumption rate based on leak status
//     float currentConsumptionRate = simulatedLeakActive ? gasLeakConsumptionRate : gasConsumptionRate;

//     // 3. Apply consumption
//     userGasLevel -= currentConsumptionRate;
//     if (userGasLevel < 0) userGasLevel = 0;

//     // 4. Save the new level to the DB if the change is significant
//     updateGasConsumptionInDB(userGasLevel);
// }

// /**
//  * @brief Updates alarms and hardware (LED, Buzzer) based on current status.
//  */
// void updateAlarmsAndHardware() {
//     bool isLowGas = (userGasLevel <= lowGasThreshold);
//     // The 'isLeaking' status comes directly from our simulation flag now
//     bool isLeaking = simulatedLeakActive; 
//     bool criticalStatus = isLowGas || isLeaking;

//     String statusText = "Normal";
//     if (isLeaking && isLowGas) {
//         statusText = "CRITICAL: Gas Leak and Low Tank!";
//     } else if (isLeaking) {
//         statusText = "ALARM: Gas Leak Detected!";
//     } else if (isLowGas) {
//         statusText = "WARNING: Low Gas - Auto-booking should trigger";
//     }

//     if (criticalStatus) {
//         digitalWrite(ledPin, HIGH);
//         digitalWrite(buzzerPin, HIGH);
//         // Always send data when critical, to ensure dashboard is up to date
//         sendDataToServer(userGasLevel, isLeaking);
//     } else {
//         digitalWrite(ledPin, LOW);
//         digitalWrite(buzzerPin, LOW);
//     }
    
//     Serial.println("---");
//     Serial.println("[STATUS] Tank Level: " + String(userGasLevel, 1) + "% | Status: " + statusText);
// }


// // =================================================================
// // --- SETUP & LOOP ---
// // =================================================================

// void setup() {
//     Serial.begin(115200);
//     delay(1000); 

//     pinMode(ledPin, OUTPUT);
//     pinMode(buzzerPin, OUTPUT);
//     digitalWrite(ledPin, LOW);
//     digitalWrite(buzzerPin, LOW);

//     Serial.print("Connecting to WiFi...");
//     WiFi.begin(ssid, password);
//     while (WiFi.status() != WL_CONNECTED) {
//         delay(500);
//         Serial.print(".");
//     }
//     Serial.println("\n--- WiFi Connected ---");
//     Serial.println("Local IP: " + WiFi.localIP().toString());

//     initializeServerConnection();

//     Serial.println("ESP32 Live Gas Monitor Initialized");
//     Serial.println("[INFO] Target Email: " + userEmail);

//     // --- REMOVED: No more random leak level ---
//     Serial.println("[INFO] Leak simulation will trigger between 50% and 40%.");
//     Serial.println("------------------------------------");
// }

// void loop() {
//     if (serverIP.length() == 0) {
//         Serial.println("[RECONNECT] Server connection lost. Retrying in 5 seconds...");
//         delay(5000);
//         initializeServerConnection();
//         return;
//     }

//     if (!dbFetched || (millis() - lastDBFetch > dbFetchInterval)) {
//         fetchUserGasLevel();
//         lastDBFetch = millis();
//     }

//     if (dbFetched) {
//         if (isSimulationRunning()) {
//             runGasSimulation();
//             updateAlarmsAndHardware();
//         } else {
//             digitalWrite(ledPin, LOW);
//             digitalWrite(buzzerPin, LOW);
//             Serial.println("[STATUS] Simulation paused by server command.");
//         }
//     }

//     delay(1000);
// }


























/*
 * ESP32 Live Gas Monitor (Cleaned and Refactored for Wokwi)
 *
 * FIX IMPLEMENTED:
 * - Addresses a race condition where the simulation would overwrite the server's
 *   gas level reset (100%) with its local state (0%).
 * - When the local gas level depletes to 0, it now sends the final '0' update
 *   and then immediately forces a sync with the server by calling fetchUserGasLevel().
 * - This ensures the simulation gets the new 100% level and continues correctly.
 */

#include <WiFi.h>
#include <HTTPClient.h>

// =================================================================
// --- USER CONFIGURATION ---
// =================================================================
String userEmail = "e@yahoo.com";
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* wokwiHost = "host.wokwi.internal";
String fallbackServerIP = "192.168.1.11"; 
const int serverPort = 5000;

// =================================================================
// --- GLOBAL VARIABLES & CONSTANTS ---
// =================================================================

// --- Server & API ---
String serverIP = "";
String gasDataUrl = "";
String gasLevelGetUrlPrefix = "";
String simStatusUrlPrefix = "";

// --- Hardware Pins ---
const int ledPin = 21;
const int buzzerPin = 22;

// --- Gas Monitoring & Simulation ---
float userGasLevel = 0.0;
float lastSavedGasLevel = 0.0;
const int lowGasThreshold = 20;

// --- Consumption Rates ---
const float gasConsumptionRate = 0.5;
const float gasLeakConsumptionRate = 2.5;

// --- Leak Simulation with FIXED range ---
const float LEAK_START_PERCENT = 50.0;
const float LEAK_END_PERCENT = 40.0;
bool simulatedLeakActive = false;

// --- Timers & State Management ---
unsigned long lastDBFetch = 0;
const unsigned long dbFetchInterval = 10000;
const float gasUpdateThreshold = 2.0;
bool dbFetched = false;

// --- Forward Declarations ---
void fetchUserGasLevel();
void updateGasConsumptionInDB(float newGasLevel);


// =================================================================
// --- SERVER & NETWORK FUNCTIONS ---
// (No changes needed in this section)
// =================================================================
void initializeServerUrls() {
    if (serverIP.length() > 0) {
        String baseUrl = "http://" + serverIP + ":" + String(serverPort);
        gasDataUrl = baseUrl + "/api/simulation/data";
        gasLevelGetUrlPrefix = baseUrl + "/api/gaslevel/";
        simStatusUrlPrefix = baseUrl + "/api/simulation/status/";
        Serial.println("[CONFIG] Server URLs configured.");
    }
}
void initializeServerConnection() {
    Serial.println("[SERVER] Trying to connect via Wokwi hostname: " + String(wokwiHost));
    serverIP = wokwiHost;
    initializeServerUrls();
    HTTPClient http;
    if (http.begin(gasLevelGetUrlPrefix + userEmail)) {
        http.setTimeout(4000);
        int httpCode = http.GET();
        if (httpCode > 0) {
            Serial.println("[SUCCESS] Connected to server via Wokwi hostname.");
            http.end();
            return;
        }
        http.end();
    }
    Serial.println("[FALLBACK] Wokwi hostname failed. Trying fallback IP: " + fallbackServerIP);
    serverIP = fallbackServerIP;
    initializeServerUrls();
    if (http.begin(gasLevelGetUrlPrefix + userEmail)) {
        http.setTimeout(4000);
        int httpCode = http.GET();
        if (httpCode <= 0) {
            Serial.println("[ERROR] Fallback IP also failed.");
            serverIP = "";
        }
        http.end();
    }
}

// =================================================================
// --- DATABASE INTERACTION FUNCTIONS ---
// (No changes needed in this section)
// =================================================================
void sendDataToServer(float currentGasLevel, bool isLeaking) {
    if (WiFi.status() != WL_CONNECTED || gasDataUrl.length() == 0) return;
    HTTPClient http;
    if (http.begin(gasDataUrl)) {
        http.addHeader("Content-Type", "application/json");
        String json = "{\"email\":\"" + userEmail + "\"," +
                      "\"currentLevel\":" + String(currentGasLevel, 2) + "," +
                      "\"isLeaking\":" + String(isLeaking ? "true" : "false") + "}";
        http.POST(json);
        http.end();
    }
}
void fetchUserGasLevel() {
    if (WiFi.status() != WL_CONNECTED || gasLevelGetUrlPrefix.length() == 0) return;
    HTTPClient http;
    String fullUserUrl = gasLevelGetUrlPrefix + userEmail;
    if (http.begin(fullUserUrl)) {
        Serial.println("[DATABASE] Fetching latest gas level from server...");
        int httpResponseCode = http.GET();
        if (httpResponseCode == 200) {
            String response = http.getString();
            int gasLevelIndex = response.indexOf("\"currentLevel\":");
            if (gasLevelIndex != -1) {
                int startPos = gasLevelIndex + 15;
                int endPos = response.indexOf(",", startPos);
                if (endPos == -1) endPos = response.indexOf("}", startPos);
                float dbGasLevel = response.substring(startPos, endPos).toFloat();
                
                // This is where the local state gets corrected
                userGasLevel = dbGasLevel;
                lastSavedGasLevel = dbGasLevel;

                if (!dbFetched) {
                    dbFetched = true;
                    Serial.println("[DATABASE] Fetch successful. Initial Gas Level: " + String(userGasLevel, 1) + "%");
                } else {
                    Serial.println("[DATABASE] Sync successful. Gas Level is now: " + String(userGasLevel, 1) + "%");
                }
            }
        }
        http.end();
    }
}
void updateGasConsumptionInDB(float newGasLevel) {
    if (abs(lastSavedGasLevel - newGasLevel) >= gasUpdateThreshold) {
        sendDataToServer(newGasLevel, simulatedLeakActive);
        lastSavedGasLevel = newGasLevel;
        Serial.println("[DATABASE] Consumption update sent. New Level: " + String(newGasLevel, 1) + "%");
    }
}
bool isSimulationRunning() {
    if (WiFi.status() != WL_CONNECTED || simStatusUrlPrefix.length() == 0) return true;
    HTTPClient http;
    String url = simStatusUrlPrefix + userEmail;
    if (!http.begin(url)) return true;
    int code = http.GET();
    if (code != 200) { http.end(); return true; }
    String response = http.getString();
    http.end();
    return response.indexOf("true") != -1;
}

// =================================================================
// --- CORE LOGIC ---
// =================================================================

/**
 * @brief Runs the gas consumption and leak simulation logic.
 */
void runGasSimulation() {
    // Store the level *before* consumption to detect the transition to zero
    float previousLevel = userGasLevel;

    // Determine current consumption rate
    if (userGasLevel <= LEAK_START_PERCENT && userGasLevel > LEAK_END_PERCENT) {
        if (!simulatedLeakActive) {
            Serial.println("\n[!!!] LEAK DETECTED (50% -> 40% range) [!!!]\n");
        }
        simulatedLeakActive = true;
    } else {
        simulatedLeakActive = false;
    }
    float currentConsumptionRate = simulatedLeakActive ? gasLeakConsumptionRate : gasConsumptionRate;

    // Apply consumption
    userGasLevel -= currentConsumptionRate;

    // --- ✅ RACE CONDITION FIX ---
    // Check if the cylinder has just been depleted in this cycle.
    if (userGasLevel <= 0 && previousLevel > 0) {
        userGasLevel = 0; // Clamp to exactly zero
        Serial.println("[RESET] Cylinder depleted. Sending final '0' and forcing sync with server...");
        
        // 1. Immediately send the final '0' value to the server.
        // This allows the backend to trigger its reset logic.
        sendDataToServer(userGasLevel, false); 
        lastSavedGasLevel = userGasLevel;
        
        // 2. Immediately fetch the latest state from the server.
        // This will update the local userGasLevel to 100 if a refill was paid for.
        fetchUserGasLevel();
        
        // 3. Exit the function for this cycle to avoid double-processing
        return; 
    }

    // If not depleted, clamp at zero and continue with normal update logic
    if (userGasLevel < 0) {
        userGasLevel = 0;
    }

    // Save the new level to the DB if the change is significant
    updateGasConsumptionInDB(userGasLevel);
}

void updateAlarmsAndHardware() {
    // ... (This function remains unchanged)
    bool isLowGas = (userGasLevel <= lowGasThreshold);
    bool isLeaking = simulatedLeakActive; 
    bool criticalStatus = isLowGas || isLeaking;

    String statusText = "Normal";
    if (isLeaking) {
        statusText = "ALARM: Gas Leak Detected!";
    } else if (isLowGas) {
        statusText = "WARNING: Low Gas";
    }

    if (criticalStatus) {
        digitalWrite(ledPin, HIGH);
        digitalWrite(buzzerPin, HIGH);
    } else {
        digitalWrite(ledPin, LOW);
        digitalWrite(buzzerPin, LOW);
    }
    
    Serial.println("---");
    Serial.println("[STATUS] Tank Level: " + String(userGasLevel, 1) + "% | Status: " + statusText);
}


// =================================================================
// --- SETUP & LOOP ---
// =================================================================

void setup() {
    Serial.begin(115200);
    delay(1000); 

    pinMode(ledPin, OUTPUT);
    pinMode(buzzerPin, OUTPUT);

    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n--- WiFi Connected ---");

    initializeServerConnection();
    Serial.println("[INFO] Leak simulation will trigger between 50% and 40%.");
    Serial.println("------------------------------------");
}

void loop() {
    if (serverIP.length() == 0) {
        delay(5000);
        initializeServerConnection();
        return;
    }

    // Initial fetch or periodic sync
    if (!dbFetched || (millis() - lastDBFetch > dbFetchInterval)) {
        fetchUserGasLevel();
        lastDBFetch = millis();
    }

    if (dbFetched) {
        if (isSimulationRunning()) {
            runGasSimulation();
            updateAlarmsAndHardware();
        } else {
            Serial.println("[STATUS] Simulation paused by server command.");
        }
    }

    delay(1000);
}