# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome browser extension that provides image hover preview functionality. When users hover over images on any webpage, the extension displays an enlarged preview of the image with improved positioning and styling.

## Architecture

### Core Components

- **manifest.json**: Chrome extension manifest (v3) defining permissions, content scripts, icons, and resources
- **content/content.js**: Main extension logic implementing image hover detection and preview functionality
- **content/content.css**: Styling for the preview overlay with dark mode support
- **icons/**: Directory containing extension icons (16x16, 48x48, 128x128 pixels)

### Key Functionality

The extension works by:
1. Injecting content script into all web pages (`<all_urls>`)
2. Monitoring mouse events (`mouseover`, `mouseout`, `mousemove`) on image elements
3. Creating a fixed-position overlay for image previews
4. Handling various image source formats (lazy-loaded images, background images, relative URLs)
5. Calculating optimal positioning to keep previews within viewport boundaries

### Image Source Detection

The extension handles multiple image source scenarios:
- Standard `<img>` elements with `src` attribute
- Lazy-loaded images using `data-src`, `data-lazy-src`, `data-original` attributes
- CSS background images via `background-image` property
- Relative URL resolution for proper image loading
- Filtering out placeholder and SVG images

### Technical Implementation

- Uses MutationObserver to handle dynamically added content
- Implements hover delay (300ms) to prevent accidental triggers
- Calculates preview positioning based on mouse coordinates and viewport bounds
- Provides loading states and error handling for image loading
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

- **content/content.js:48-91**: `getImageSrc()` function - handles image source detection and URL resolution
- **content/content.js:93-118**: `calculatePosition()` function - manages preview positioning logic
- **content/content.js:120-213**: `showPreview()` function - core preview display logic
- **content/content.js:268-280**: `isValidImageElement()` function - determines which elements should trigger previews
- **content/content.css:43-57**: Dark mode styles using `prefers-color-scheme`
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
└── CLAUDE.md              # This documentation file
```