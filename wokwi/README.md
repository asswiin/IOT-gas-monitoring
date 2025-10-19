# ESP32 Gas Monitor - Wokwi Project

## Overview

This project provides real-time gas monitoring using ESP32 with automatic gas level simulation and leak detection. The system integrates with the main backend database to provide realistic gas consumption patterns.

## Key Features

### 1. **Continuous Gas Simulation**
- Automatic gas consumption at 0.5% per second (normal usage)
- Leak simulation between 50%-40% gas levels (2.5% consumption rate)
- Automatic cylinder replacement when gas reaches 0%
- Real-time hardware alerts (LED and buzzer)

### 2. **Database Integration**
- Fetches real user gas levels from backend database
- Updates consumption patterns every 2% change
- Maintains gas usage history
- Supports refill activation system

### 3. **Hardware Components**
- **Gas Sensor**: Analog pin 32, Digital pin 33
- **LED Alert**: Pin 21 (active during low gas/leak)
- **Buzzer**: Pin 22 (active during alerts)
- **WiFi Connectivity**: For database communication

## User Configuration

### **Getting Real User Emails:**

1. **Use existing test users:**
   - `e@yahoo.com` (configured in ESP32 code)
   - `user@example.com`
   - `test@gmail.com`

2. **Update ESP32 for your user:**
   ```cpp
   // In src/main.cpp, line 8:
   String userEmail = "your-registered-user@email.com";
   ```

## Usage Instructions

### **Wokwi Simulation (Recommended)**

1. **Open Wokwi Project**: Click "Play" to start simulation
2. **Monitor Serial Output**: Shows real-time gas levels and status
3. **Test Gas Detection**: 
   - Normal operation: 100% → 50% (green status)
   - Leak simulation: 50% → 40% (red alert, buzzer active)
   - Low gas: 40% → 0% (yellow warning)
4. **Refill Testing**: When gas reaches 0%, system checks for paid refills

### **Real Hardware Setup**

1. **Build firmware:**
   ```bash
   # Windows: build.bat
   # Linux/Mac: ./build.sh
   # Or: pio run
   ```

2. **Configure for your setup:**
   - Update WiFi credentials in `src/main.cpp`
   - Set `serverIP` to your server's IP address
   - Ensure backend is running on port 5000

## System Behavior

### **Gas Consumption Rates:**
- **Normal**: 0.5% per second
- **Leak (50%-40%)**: 2.5% per second  
- **Database Sync**: Every 2% change or 10 seconds

### **Alert Thresholds:**
- **Normal**: > 40% gas level
- **Low Gas Warning**: 20-40% gas level
- **Critical/Leak**: < 20% or leak detected
- **Hardware Alert**: LED + Buzzer active during critical states

### **Automatic Features:**
- **Auto-booking**: Triggered at 20% gas level in backend
- **Cylinder Replacement**: When gas reaches 0% and refill paid
- **Leak Detection**: Simulated between 50%-40% range
- **Status Reporting**: Continuous updates to dashboard

## API Integration

### **Endpoints Used:**
- `POST /api/simulation/data` - Send sensor readings to backend
- `GET /api/gaslevel/:email` - Fetch current user gas level
- Backend handles auto-booking and refill logic

### **Data Format:**
```json
{
  "email": "user@example.com",
  "currentLevel": 45.2,
  "isLeaking": false
}
```

## Troubleshooting

### **Connection Issues:**
- Verify backend server is running on port 5000
- Check WiFi credentials in ESP32 code
- Ensure user email exists in database

### **Simulation Not Working:**
- Check serial monitor for error messages
- Verify user has active gas connection in backend
- Ensure database connection is successful

### **No Alerts:**
- Confirm hardware connections (LED pin 21, Buzzer pin 22)
- Check gas level is within alert thresholds
- Verify leak simulation range (50%-40%)

## Development Notes

- **Wokwi Testing**: Use built-in gas sensor controls to test leak detection
- **Real Hardware**: Connect MQ-2 or similar gas sensor to pins 32/33
- **Database Simulation**: System works with or without real backend connection
- **Consumption Rate**: Adjustable in code for different testing scenarios

The system now runs continuously without requiring manual start/stop commands, providing a more realistic gas monitoring experience.