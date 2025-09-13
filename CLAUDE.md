# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome browser extension that provides image hover preview functionality. When users hover over images on any webpage, the extension displays an enlarged preview of the image with improved positioning and styling.

## Architecture

### Core Components

- **manifest.json**: Chrome extension manifest (v3) defining permissions, content scripts, popup, and resources
- **content/content.js**: Main extension logic implementing image hover detection and preview functionality
- **content/content.css**: Styling for the preview overlay with dark mode support
- **popup/popup.html**: Extension popup interface for per-site toggle control and preview size settings
- **popup/popup.js**: Popup functionality handling user preferences, size settings, and Chrome storage
- **icons/**: Directory containing extension icons (16x16, 48x48, 128x128 pixels)

### Key Functionality

The extension works by:
1. Injecting content script into all web pages (`<all_urls>`)
2. Providing a popup interface for users to enable/disable functionality per website
3. Offering customizable preview size settings (20% - 100% of viewport) with slider and manual input
4. Monitoring mouse events (`mouseover`, `mouseout`, `mousemove`) on image elements
5. Creating a fixed-position overlay for image previews with user-defined size constraints
6. Handling various image source formats (lazy-loaded images, background images, relative URLs)
7. Calculating optimal positioning to keep previews within viewport boundaries using custom size ratios
8. Storing user preferences per domain and global size settings using Chrome storage API
9. Real-time synchronization between popup settings and content script behavior

### Image Source Detection

The extension handles multiple image source scenarios:
- Standard `<img>` elements with `src` attribute
- Lazy-loaded images using `data-src`, `data-lazy-src`, `data-original` attributes
- CSS background images via `background-image` property
- Relative URL resolution for proper image loading
- Filtering out placeholder and SVG images

### Technical Implementation

- Uses MutationObserver to handle dynamically added content
- Implements hover delay (150ms) to prevent accidental triggers
- Calculates preview positioning based on mouse coordinates, viewport bounds, and custom size settings
- Provides loading states and error handling for image loading
- Per-domain enable/disable functionality with Chrome storage persistence
- Global preview size settings with real-time updates and storage persistence
- Runtime messaging between popup and content scripts for real-time updates
- Auto-clamping of size input values to valid range (20-100%)
- Debounced saving for smooth user experience during size adjustments
- Intelligent image size checking to avoid unnecessary previews for already large images
- Includes extensive console logging for debugging

## Development

### No Build Process
This is a vanilla JavaScript Chrome extension with no build system, package.json, or dependencies. Development is done directly on the source files.

### Testing
- Load the extension in Chrome via "Load unpacked" in developer mode
- Test on various websites with different image types
- Check browser console for debug logs from the extension

### Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

### Key Files for Modification

**Content Script Core Logic**:
- **content/content.js:9**: `previewMaxSize` variable - stores current size setting (default 80%)
- **content/content.js:12-25**: `checkIfEnabled()` function - loads both site preferences and size settings from storage
- **content/content.js:39-49**: Size update message handler - receives size changes from popup
- **content/content.js:136-143**: `calculatePosition()` function - uses `previewMaxSize` to calculate preview bounds
- **content/content.js:getImageSrc()**: Image source detection and URL resolution
- **content/content.js:showPreview()**: Core preview display logic with domain checking
- **content/content.js:isValidImageElement()**: Determines which elements should trigger previews

**Popup Interface**:
- **popup/popup.html:184-199**: Size settings UI with slider and input controls
- **popup/popup.js:10-12**: Size configuration constants (MIN_SIZE, MAX_SIZE, DEFAULT_SIZE)
- **popup/popup.js:189-208**: `clampSize()` function - validates and corrects input values
- **popup/popup.js:225-270**: `saveSizeSetting()` function - handles storage and content script messaging
- **popup/popup.js:77-162**: Event handlers for slider and manual input with debouncing

**Styling**:
- **content/content.css:43-57**: Dark mode styles using `prefers-color-scheme`
- **popup/popup.html:97-162**: Size control styling (slider, input, display elements)

**Configuration**:
- **icons/**: Replace placeholder PNG files with actual extension icons

## Directory Structure

```
chrome-ext-image-hover-preview/
├── manifest.json           # Extension manifest and configuration
├── icons/                  # Extension icons
│   ├── icon16.png         # 16x16 icon (toolbar)
│   ├── icon48.png         # 48x48 icon (extension management)
│   └── icon128.png        # 128x128 icon (Chrome Web Store)
├── content/               # Content script files
│   ├── content.js         # Main functionality logic
│   └── content.css        # Preview overlay styling
├── popup/                 # Extension popup interface
│   ├── popup.html         # Popup UI structure
│   └── popup.js           # Popup functionality and logic
├── CLAUDE.md              # This documentation file
└── README.md              # Project README
```