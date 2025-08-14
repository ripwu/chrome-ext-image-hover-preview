# Image Hover Preview

[![GitHub release](https://img.shields.io/github/v/release/ripwu/chrome-ext-image-hover-preview)](https://github.com/ripwu/chrome-ext-image-hover-preview/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/YOUR_EXTENSION_ID)](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)
[![License](https://img.shields.io/github/license/ripwu/chrome-ext-image-hover-preview)](https://github.com/ripwu/chrome-ext-image-hover-preview/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ripwu/chrome-ext-image-hover-preview)](https://github.com/ripwu/chrome-ext-image-hover-preview/stargazers)

A Chrome browser extension that provides image hover preview functionality for any webpage. When hovering over images, it automatically displays an enlarged preview of the image.

## 🚀 Quick Install

**From Chrome Web Store** (Recommended):
- [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID) 

**From Source**:
- Follow the [Developer Mode Installation](#developer-mode-installation) instructions below

## Features

- 🖼️ **Smart Image Detection** - Supports `<img>` tags and CSS background images
- 🔍 **Auto-Enlargement Preview** - Only shows preview when the original image is larger than the display size
- 📱 **Responsive Positioning** - Intelligently adjusts preview position to avoid viewport boundaries
- 🌙 **Dark Mode Support** - Automatically adapts to system dark/light theme
- ⚡ **Lazy Loading Support** - Handles various lazy loading image formats (data-src, data-lazy-src, etc.)
- 🚀 **Dynamic Content Support** - Uses MutationObserver to monitor newly added image elements
- 🎨 **Elegant Transition Effects** - Smooth fade-in and fade-out animations
- 🎛️ **Per-Site Control** - Can enable or disable functionality for each website individually
- 💾 **Settings Persistence** - User preference settings are automatically saved

## Installation

### Developer Mode Installation

1. Download or clone this repository to local
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the project root directory
6. Extension installed successfully!

## Usage

After installation, the extension will automatically work on all web pages:

1. **Basic Usage**:
   - Hover your mouse over any image
   - Wait 150ms for the enlarged preview to automatically display
   - Move mouse away or scroll the page to hide the preview
   - Preview follows mouse movement and intelligently avoids boundaries

2. **Control Settings**:
   - Click the extension icon in the browser toolbar
   - Use the toggle to enable or disable functionality for the current website
   - Settings are automatically saved and take effect on next visit

## Technical Implementation

### Supported Image Formats

- Standard `<img>` elements
- CSS `background-image` property
- Lazy-loaded images:
  - `data-src`
  - `data-lazy-src` 
  - `data-original`
  - Other common lazy loading attributes

### Smart Filtering

- Automatically skips placeholder images (SVG, GIF, etc.)
- Only shows preview for images that need enlargement
- Handles relative path URL conversion

### Performance Optimization

- Uses debounce mechanism to avoid frequent triggering
- Smart caching and DOM operation optimization
- Minimizes reflow and repaint

## Project Structure

```
chrome-ext-image-hover-preview/
├── manifest.json           # Extension manifest file
├── icons/                  # Extension icons
│   ├── icon16.png         # 16x16 icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 icon
├── content/               # Content scripts
│   ├── content.js         # Main functionality logic
│   └── content.css        # Preview styles
├── popup/                 # Extension popup interface
│   ├── popup.html         # Popup UI structure
│   └── popup.js           # Popup functionality logic
├── CLAUDE.md              # Developer documentation
└── README.md              # Project documentation
```

## Development and Debugging

### Debug Information

The extension provides detailed debug information in the browser console:

```javascript
// View debug logs in console
console.log('ImageHover Debug:', {
    element: element,
    resolvedSrc: imgSrc,
    naturalWidth: element.naturalWidth,
    // ... more debug information
});
```

### Configuration Modification

You can adjust the following parameters in `content/content.js`:

```javascript
const HOVER_DELAY = 150;  // Hover delay time (milliseconds)
```

## Browser Compatibility

- ✅ Chrome 88+ (Manifest V3 support)
- ✅ Microsoft Edge 88+
- ✅ Other Chromium-based browsers

## Permissions Explanation

This extension only uses the following permissions:

- `activeTab` - Allows running content scripts in the currently active tab
- `storage` - Stores user's per-site enable/disable preference settings
- No need to access user data or send network requests

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

1. Fork this repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## 📦 Chrome Web Store Publication

This extension is available on the Chrome Web Store. If you encounter any issues or have suggestions:

- **Report bugs**: [GitHub Issues](https://github.com/ripwu/chrome-ext-image-hover-preview/issues)
- **Request features**: [Feature Requests](https://github.com/ripwu/chrome-ext-image-hover-preview/issues/new?template=feature_request.md)
- **Chrome Web Store**: [Rate and Review](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)

## 🔗 Links

- **GitHub Repository**: https://github.com/ripwu/chrome-ext-image-hover-preview
- **Chrome Web Store**: https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID
- **Issues**: https://github.com/ripwu/chrome-ext-image-hover-preview/issues
- **Releases**: https://github.com/ripwu/chrome-ext-image-hover-preview/releases
- **Privacy Policy**: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)

## License

[MIT License](LICENSE)

## Changelog

### v1.0.0
- Initial version release
- Basic image hover preview functionality
- Support for lazy-loaded images
- Dark mode adaptation
- Smart positioning and boundary detection
- Add popup interface for per-site control
- Add Chrome storage API support for user preference settings
- Optimize image size detection logic
- Reduce hover delay to 150ms for improved responsiveness