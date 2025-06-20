# SmartScale Web Dashboard

A modern web application for connecting to the SmartScale via Bluetooth Low Energy (BLE) to track nutrition information and weight measurements in real-time.

## Features

- 🔗 **BLE Connectivity**: Connect wirelessly to your SmartScale device
- ⚖️ **Real-time Weight**: Live weight updates as you place items on the scale
- 🍎 **Nutrition Tracking**: Detailed nutrition information for scanned products
- 📊 **Session Summary**: Track total weight and calories for your session
- 📱 **PWA Support**: Install as a mobile app for offline use
- 🔧 **WiFi Configuration**: Configure your scale's WiFi settings remotely
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## Browser Compatibility

This app requires **Web Bluetooth API** support:

- ✅ **Chrome/Edge** (Desktop & Mobile): Full support
- ✅ **Chrome for Android**: Full support
- ❌ **Firefox**: Not supported (no Web Bluetooth)
- ❌ **Safari**: Not supported (no Web Bluetooth)

For the best experience, use **Chrome** or **Microsoft Edge**.

## Usage Guide

### Connecting to Your SmartScale

1. **Power on** your SmartScale device
2. **Open the web app** in Chrome/Edge browser
3. **Click "Connect Scale"** button
4. **Select "SmartScale"** from the Bluetooth device list
5. **Wait for connection** - you'll see a success notification

### Using the Scale

1. **Scan a barcode** using the physical barcode scanner
2. **Place items** on the scale to see weight and nutrition info
3. **Press the ADD button** on the scale to add items to your session
4. **Press TARE** to zero the scale
5. **Hold both buttons** for 1 second to reset the entire session

### WiFi Configuration

1. **Connect via BLE** first
2. **Click "Configure WiFi"** in the settings panel
3. **Enter your network credentials**
4. **Submit** - the scale will try the new WiFi settings

## License

This project is part of the SmartScale system for educational/research purposes.

## Support

For issues with:

- **Hardware**: Check ESP32 connections and power
- **BLE**: Ensure proper browser and HTTPS
- **Web App**: Check browser console for errors

---

**Note**: This web app requires a compatible SmartScale device with the provided ESP32 firmware.
