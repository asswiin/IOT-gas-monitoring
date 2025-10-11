# ESP32 Gas Monitor - Wokwi Project

## Fixes Applied

### 1. **Pin Configuration**
- Fixed gas sensor analog pin from `A0` to `32` (ESP32 compatible)
- Added separate digital pin `33` for digital gas sensor output
- Properly configured LED (pin 21) and Buzzer (pin 22) pins

### 2. **Backend Integration**
- Fixed server route references from `sensor` to `Sensors.js`
- Added gas routes integration with `/api/gas/sensor` endpoint
- Enhanced sensor data model to include `gasLevel`, `gasValue`, and `digitalValue`
- Added status detection (normal, low, medium, leak)

### 3. **Wokwi Configuration**
- Updated `wokwi.toml` to use PlatformIO build output
- Added analog output connection in `diagram.json`
- Fixed firmware path to use compiled binary

### 4. **Code Improvements**
- Enhanced ESP32 code with proper analog/digital reading
- Added WiFi connection status checking
- Improved error handling and logging
- Added threshold-based alarm activation

### 5. **Build System**
- Added PlatformIO configuration with required libraries
- Created build scripts for Windows and Unix systems
- Proper library dependencies (WiFi, HTTPClient, ArduinoJson)

## User Configuration

### **Getting Real User IDs from Backend:**

1. **Run API Test:**
   ```bash
   cd backend
   node test-api.js
   ```

2. **Or use these pre-configured users:**
   - **Admin (aswin)**: `689b67d4e9bd7690bca0c0c7`
   - **User (jaseem)**: `68a73147aab2a2fb0656cc5d`
   - **User (mohammed jaseem)**: `68deac8f17b9f4f894ce9d69`
   - See `USER_CONFIG.cpp` for complete list

3. **Update ESP32 code:**
   ```cpp
   // In src/main.cpp, replace this line:
   String userId = "689b67d4e9bd7690bca0c0c7"; // Choose your user ID
   ```

## Usage

### **Option 1: Wokwi Simulation (Recommended for Testing)**

1. **Run in Wokwi:**
   - Open the project in Wokwi
   - Click the "Play" button to start simulation
   - **To test gas detection:** Click on the gas sensor component
   - Adjust the "Gas concentration" slider (0-100%)
   - Watch the serial monitor for real-time readings
   - LED and buzzer will activate when gas is detected

2. **Testing Gas Levels:**
   - **0-20%**: Normal operation, no alarm
   - **20-50%**: Medium gas detection  
   - **50%+**: High gas - alarm activated
   - **Digital trigger**: Immediate alarm regardless of analog value

3. **Network Testing:**
   - The simulation uses a test endpoint (httpbin.org)
   - Connection errors are expected and handled gracefully
   - Focus on sensor readings and local alarm functionality

### **Option 2: Real Hardware Integration**

1. **Build the project:**
   ```bash
   # Windows
   build.bat
   
   # Linux/Mac
   ./build.sh
   
   # Or manually
   pio run
   ```

2. **Configure for Real Server:**
   - Open `src/main.cpp`
   - Update WiFi credentials
   - Change `serverUrl` to your server IP
   - Set `useRealServer = true`

3. **Test Server (Optional):**
   ```bash
   cd wokwi
   npm install express cors
   node test-server.js
   # Use http://YOUR_IP:3001/sensor as serverUrl
   ```

4. **Backend Integration:**
   - Ensure main backend is running on port 5000
   - ESP32 will send data to `/api/gas/sensor` endpoint
   - View logs in backend console for received data

## Database-Driven Gas Monitoring

The system now integrates with real database for gas levels:

- **Data Source**: Fetches actual gas levels from database every 10 seconds
- **Consumption Rate**: 0.05% per reading (realistic usage)
- **Database Updates**: Updates DB every 0.5% gas level change
- **User Tracking**: Real user data from backend database
- **Sensor Separation**: Physical sensor leaks separate from gas level warnings

## Sensor Data Format

```json
{
  "gasLevel": 75,        // User's remaining gas percentage (0-100)
  "gasValue": 1234,      // Raw sensor analog value (0-4095)
  "digitalValue": 0,     // Digital sensor output (0 or 1)
  "userId": "USER001"    // User identifier
}
```

## Status Levels

- **Normal**: Gas level > 70% and no sensor leak
- **Medium**: Gas level 40-70%
- **Low**: Gas level 20-40%
- **Critical**: Gas level < 20% OR sensor leak detected
- **Auto-Refill**: Occurs automatically at 5% level

## API Endpoints

- `POST /api/gas/sensor` - Receive ESP32 sensor data
- `POST /api/gas/refill` - Manual gas refill (testing)
- `GET /api/gas/status` - Get current gas status