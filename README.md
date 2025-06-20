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
- 🔒 **Privacy-First**: No external dependencies, all assets served locally

## Dependencies & Libraries

### Core Technologies

- **Vanilla JavaScript** - No frameworks, pure ES6+
- **CSS3** - Modern CSS with CSS Grid and Flexbox
- **HTML5** - Semantic markup with PWA manifest
- **Web Bluetooth API** - For BLE communication
- **Service Workers** - For offline functionality

### External Resources (Bundled Locally)

- **Inter Font Family** - Modern, readable typography
- **Lucide Icons** - Beautiful, lightweight SVG icons
- **No external CDNs** - All assets served locally for privacy

### Browser APIs Used

- Web Bluetooth API
- Service Worker API
- Cache API
- Notifications API
- Local Storage API

## Browser Compatibility

This app requires **Web Bluetooth API** support:

- ✅ **Chrome/Edge** (Desktop & Mobile): Full support
- ✅ **Chrome for Android**: Full support
- ❌ **Firefox**: Not supported (no Web Bluetooth)
- ❌ **Safari**: Not supported (no Web Bluetooth)

For the best experience, use **Chrome** or **Microsoft Edge**.

## Privacy & Data Protection

- 🔒 **No External Tracking** - All resources served locally
- 🔒 **No Cookies** - No external analytics or tracking cookies
- 🔒 **Local Storage Only** - Data stays on your device
- 🔒 **No Data Collection** - We don't collect or transmit personal data

## Installation & Setup

### Option 1: Direct Use

1. Open `index.html` in Chrome/Edge
2. Connect to your SmartScale
3. Start tracking nutrition!

### Option 2: PWA Installation

1. Open the app in Chrome/Edge
2. Look for "Install" prompt or use browser menu
3. Install as standalone app

### Option 3: Local Server (Recommended)

```bash
# Serve locally for HTTPS (required for BLE)
python -m http.server 8000
# or
npx http-server
```

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

## File Structure

```
WebApp/
├── index.html          # Main application
├── script.js           # Core JavaScript logic
├── styles.css          # All styling
├── sw.js              # Service Worker for PWA
├── manifest.json       # PWA configuration
├── assets/
│   ├── fonts/          # Inter font files (variable font)
│   │   ├── inter.css   # Font-face declarations
│   │   └── *.woff2     # Font files
│   ├── icons/          # SVG icon files
│   │   ├── icons.css   # Icon system CSS
│   │   └── *.svg       # Individual icon files
│   └── images/         # PWA icons
└── README.md           # This file
```

## Icon System

The app uses an inline SVG icon system sourced from Lucide icons. All icons are stored as JavaScript strings and generated dynamically:

- **25+ Icons**: All icons used in the app
- **Inline SVG**: No external files, rendered as inline SVG elements
- **Color Adaptive**: Icons inherit text color via stroke
- **Size Variants**: `.icon`, `.icon-lg`, `.icon-xl`, `.icon-2xl`
- **Dynamic Generation**: Icons created via JavaScript functions
- **No External Dependencies**: Everything bundled locally

### Available Icons

- **Connectivity**: bluetooth, wifi, link, unlink
- **Interface**: settings, plus, refresh, search, history
- **Data**: chart-line, chart-pie, calculator, barcode
- **Status**: check-circle, exclamation-circle, exclamation-triangle, info-circle, question-circle
- **Content**: weight, scale-balanced, balance-scale, list, plus-circle
- **Nutrition**: fire (energy), cookie-bite (carbs), cube (minerals)

### Usage

Icons are automatically converted from div elements to inline SVGs:

```html
<!-- This gets automatically converted to inline SVG -->
<div class="icon icon-bluetooth"></div>

<!-- Or create programmatically -->
<script>
  const iconHTML = createIcon("bluetooth", "icon");
</script>
```

## Development

### Adding New Icons

1. Get SVG path data from Lucide (https://lucide.dev/)
2. Add to `iconDefinitions` object in `assets/icons/icon-definitions.js`
3. Icon becomes available via `createIcon('icon-name', 'icon')`
4. Use in HTML as `<div class="icon icon-[name]"></div>`

### Font Customization

The Inter variable font family is included locally. Files are already optimized for web delivery.

## License

This project is part of the SmartScale system for educational/research purposes.

## Support

For issues with:

- **Hardware**: Check ESP32 connections and power
- **BLE**: Ensure proper browser and HTTPS
- **Web App**: Check browser console for errors

---

**Note**: This web app requires a compatible SmartScale device with the provided ESP32 firmware.
