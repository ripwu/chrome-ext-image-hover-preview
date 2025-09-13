# Privacy Policy for Image Hover Preview Extension

**Last updated: January 2025**

## Overview

Image Hover Preview is a browser extension that provides image preview functionality on web pages. This privacy policy explains how the extension handles user data and privacy.

## Data Collection

**We DO NOT collect any personal data.** The extension:

- ✅ Does NOT collect browsing history
- ✅ Does NOT collect personal information
- ✅ Does NOT track user behavior
- ✅ Does NOT send data to external servers
- ✅ Does NOT use analytics or tracking services

## Local Data Storage

The extension only stores:

1. **User Preferences**: Per-website enable/disable settings chosen by the user
   - Example: `{"disabled_example.com": true}`
   - Stored locally using Chrome's storage API
   - Never transmitted or shared

2. **Preview Size Settings**: Global preview size preference chosen by the user
   - Example: `{"previewMaxSize": 80}` (80% of viewport)
   - Stored locally using Chrome's storage API
   - Applied across all websites
   - Never transmitted or shared

## Permissions Usage

### activeTab Permission
- **Purpose**: Access current webpage to detect images and provide preview functionality
- **Scope**: Only the currently active tab when extension is used
- **Data Access**: Only image elements and related DOM content for preview purposes

### storage Permission
- **Purpose**: Save user's per-site preferences and global preview size settings locally
- **Scope**: Local browser storage only
- **Data Stored**: Enable/disable settings per domain and preview size percentage (20-100%)

### Host Permissions (<all_urls>)
- **Purpose**: Work on all websites to provide universal image preview functionality
- **Scope**: Content script injection for image detection
- **Data Access**: Only image-related content for preview display

## Data Processing

All data processing happens locally in your browser:
- Image detection and preview generation
- User preference storage and retrieval (site preferences and size settings)
- Preview size calculation and UI updates
- No data is sent to external servers

## Third-Party Services

The extension does NOT use any third-party services, analytics, or external APIs.

## Data Security

- All data remains local to your browser
- No network requests are made by the extension
- User preferences are stored securely using Chrome's storage API

## Contact

For privacy concerns or questions:
- GitHub Issues: https://github.com/ripwu/chrome-ext-image-hover-preview/issues
- Repository: https://github.com/ripwu/chrome-ext-image-hover-preview

## Changes to Privacy Policy

We will update this privacy policy if needed. Changes will be posted on the GitHub repository.

---

**Version**: 1.1.0
**Effective Date**: January 2025