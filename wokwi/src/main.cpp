

#include <WiFi.h>
#include <HTTPClient.h>

// =================================================================
// --- USER CONFIGURATION ---
// =================================================================
String userEmail = "z@gmail.com";
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
String simulationStatusUrlPrefix = ""; // NEW: For polling the sim status

// --- Hardware Pins ---
const int ledPin = 21;
const int buzzerPin = 22;

// --- Gas Monitoring & Simulation ---
float userGasLevel = 0.0;
float lastSavedGasLevel = 0.0;
const int lowGasThreshold = 20;
bool isSimulationRunning = false; // NEW: Controls the simulation

// --- Consumption Rates ---
const float gasConsumptionRate = 10.0;
const float gasLeakConsumptionRate = 2.5;

// --- Leak Simulation with FIXED range ---
const float LEAK_START_PERCENT = 60.0;
const float LEAK_END_PERCENT = 40.0;
bool simulatedLeakActive = false;

// --- Timers & State Management ---
unsigned long lastDBFetch = 0;
unsigned long lastStatusPoll = 0; // NEW: Timer for status polling
const unsigned long dbFetchInterval = 10000;
const unsigned long statusPollInterval = 2000; // NEW: Poll every 2 seconds
const float gasUpdateThreshold = 2.0;
bool dbFetched = false;

// --- Forward Declarations ---
void fetchUserGasLevel();
void updateGasConsumptionInDB(float newGasLevel);
void fetchSimulationStatus();


// =================================================================
// --- SERVER & NETWORK FUNCTIONS ---
// =================================================================
void initializeServerUrls() {
    if (serverIP.length() > 0) {
        String baseUrl = "http://" + serverIP + ":" + String(serverPort);
        gasDataUrl = baseUrl + "/api/simulation/data";
        gasLevelGetUrlPrefix = baseUrl + "/api/gaslevel/";
        simulationStatusUrlPrefix = baseUrl + "/api/simulation/status/"; // NEW
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

// =================================================================
// --- CORE LOGIC ---
// =================================================================

// NEW FUNCTION: Polls the backend for the simulation running state
void fetchSimulationStatus() {
    if (WiFi.status() != WL_CONNECTED || simulationStatusUrlPrefix.length() == 0) return;
    HTTPClient http;
    String statusUrl = simulationStatusUrlPrefix + userEmail;
    if (http.begin(statusUrl)) {
        int httpCode = http.GET();
        if (httpCode == 200) {
            String response = http.getString();
            bool serverState = (response.indexOf("true") != -1);
            if (serverState != isSimulationRunning) {
                isSimulationRunning = serverState;
                Serial.println(isSimulationRunning ? "[CONTROL] Received START command." : "[CONTROL] Received STOP command.");
            }
        }
        http.end();
    }
}

void runGasSimulation() {
    // MODIFIED: The simulation will only run if this flag is true
    if (!isSimulationRunning) {
        return; 
    }
    
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

    // Check if cylinder depleted and handle refill activation
    if (userGasLevel <= 0 && previousLevel > 0) {
        userGasLevel = 0;
        Serial.println("[RESET] Cylinder depleted. Sending final '0' and forcing sync with server...");
        
        sendDataToServer(userGasLevel, false); 
        lastSavedGasLevel = userGasLevel;
        
        fetchUserGasLevel();
        return; 
    }

    if (userGasLevel < 0) {
        userGasLevel = 0;
    }

    updateGasConsumptionInDB(userGasLevel);
}

void updateAlarmsAndHardware() {
    bool isLowGas = (userGasLevel <= lowGasThreshold);
    bool isLeaking = simulatedLeakActive; 
    bool criticalStatus = isLowGas || isLeaking;

    String statusText = "Normal";
    if (isLeaking) {
        statusText = "ALARM: Gas Leak Detected!";
    } else if (isLowGas) {
        statusText = "WARNING: Low Gas";
    }

    // MODIFIED: Added simulation running status to the log
    String simStatus = isSimulationRunning ? "RUNNING" : "STOPPED";
    if (!dbFetched) {
      simStatus = "WAITING";
    }

    if (criticalStatus) {
        digitalWrite(ledPin, HIGH);
        digitalWrite(buzzerPin, HIGH);
    } else {
        digitalWrite(ledPin, LOW);
        digitalWrite(buzzerPin, LOW);
    }
    
    Serial.println("---");
    Serial.println("[STATUS] Tank Level: " + String(userGasLevel, 1) + "% | Simulation: " + simStatus + " | Status: " + statusText);
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
    // MODIFIED: Updated instructions
    Serial.println("[INFO] Leak simulation will trigger between 50% and 40%.");
    Serial.println("[INFO] Waiting for 'Start' command from dashboard...");
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

    // NEW: Periodically check for start/stop commands
    if (millis() - lastStatusPoll > statusPollInterval) {
        fetchSimulationStatus();
        lastStatusPoll = millis();
    }

    // Run simulation and update hardware state
    if (dbFetched) {
        runGasSimulation();
        updateAlarmsAndHardware();
    }

    delay(1000);
}