(function() {
    'use strict';
    
    let overlay = null;
    let currentImage = null;
    let hoverTimer = null;
    const HOVER_DELAY = 150;
    let isExtensionEnabled = true; // Whether extension is enabled for current domain
    let previewMaxSize = 80; // Maximum preview size as percentage of viewport (default 80%)
    
    // Check if current domain is disabled and load size settings
    async function checkIfEnabled() {
        try {
            const hostname = window.location.hostname;
            const result = await chrome.storage.local.get([`disabled_${hostname}`, 'previewMaxSize']);
            isExtensionEnabled = !result[`disabled_${hostname}`];
            previewMaxSize = result['previewMaxSize'] || 80;
            console.log('ImageHover: Extension enabled status for', hostname, ':', isExtensionEnabled);
            console.log('ImageHover: Preview max size:', previewMaxSize + '%');
        } catch (error) {
            console.log('ImageHover: Could not check storage, defaulting to enabled');
            isExtensionEnabled = true;
            previewMaxSize = 80;
        }
    }
    
    // Listen to messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'togglePreview') {
            isExtensionEnabled = request.enabled;
            console.log('ImageHover: Received toggle message, enabled:', isExtensionEnabled);
            
            // If disabled, hide current preview
            if (!isExtensionEnabled) {
                hidePreview();
            }
            
            sendResponse({ success: true });
        } else if (request.action === 'updateSize') {
            previewMaxSize = request.maxSize;
            console.log('ImageHover: Updated preview max size to:', previewMaxSize + '%');
            
            // If there's an active preview, hide it so the new size will apply on next hover
            if (overlay) {
                hidePreview();
            }
            
            sendResponse({ success: true });
        }
    });
    
    function createOverlay() {
        if (overlay) return overlay;
        
        overlay = document.createElement('div');
        overlay.id = 'image-hover-preview';
        overlay.style.cssText = `
            position: fixed !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            background: #fff;
            border: 2px solid #ddd;
            max-width: 80vw;
            max-height: 80vh;
            overflow: hidden;
            display: block !important;
            visibility: visible !important;
        `;
        
        const img = document.createElement('img');
        img.style.cssText = `
            display: block;
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
        `;
        
        overlay.appendChild(img);
        document.body.appendChild(overlay);
        
        return overlay;
    }
    
    function getImageSrc(element) {
        if (element.tagName === 'IMG') {
            // Prefer data-src (lazy loading)
            let src = element.dataset.src || element.getAttribute('data-src');
            if (!src) {
                src = element.src;
            }
            
            // Filter out placeholder images
            if (src && (
                src.startsWith('data:image/gif;base64,R0lGOD') ||
                src.startsWith('data:image/svg+xml') ||
                src === 'data:,' ||
                src.includes('placeholder')
            )) {
                // Try other lazy loading attributes
                src = element.dataset.lazySrc || 
                      element.dataset.original || 
                      element.getAttribute('data-lazy-src') ||
                      element.getAttribute('data-original');
            }
            
            // Handle relative path URLs
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                if (src.startsWith('//')) {
                    src = window.location.protocol + src;
                } else if (src.startsWith('/')) {
                    src = window.location.origin + src;
                } else {
                    // Relative path, based on current page URL
                    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                    src = baseUrl + src;
                }
            }
            
            return src;
        }
        
        const bgImage = window.getComputedStyle(element).backgroundImage;
        const match = bgImage.match(/url\(["']?([^"']*)["']?\)/);
        if (match && match[1]) {
            return match[1];
        }
        
        return null;
    }
    
    function calculatePosition(mouseX, mouseY, imageWidth, imageHeight) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Use custom preview max size setting
        const sizeRatio = previewMaxSize / 100;
        const maxWidth = Math.min(imageWidth, viewportWidth * sizeRatio);
        const maxHeight = Math.min(imageHeight, viewportHeight * sizeRatio);
        
        // For fixed positioning, use viewport coordinates directly, no need to add scroll offset
        let left = mouseX + 15;
        let top = mouseY + 15;
        
        // Ensure preview doesn't exceed viewport boundaries
        if (left + maxWidth > viewportWidth - 20) {
            left = mouseX - maxWidth - 15;
        }
        
        if (top + maxHeight > viewportHeight - 20) {
            top = mouseY - maxHeight - 15;
        }
        
        // Ensure it doesn't exceed viewport top-left corner
        left = Math.max(10, left);
        top = Math.max(10, top);
        
        return { left, top, width: maxWidth, height: maxHeight };
    }
    
    function showPreview(element, mouseEvent) {
        // Check if extension is enabled for current domain
        if (!isExtensionEnabled) {
            console.log('ImageHover: Extension is disabled for this domain');
            return;
        }
        
        const imgSrc = getImageSrc(element);
        
        // Debug information (can be viewed in console)
        console.log('ImageHover Debug:', {
            element: element,
            tagName: element.tagName,
            src: element.src,
            dataSrc: element.dataset.src,
            resolvedSrc: imgSrc,
            naturalWidth: element.naturalWidth,
            naturalHeight: element.naturalHeight,
            displayWidth: element.width,
            displayHeight: element.height
        });
        
        if (!imgSrc) {
            console.log('ImageHover: No valid image source found');
            return;
        }
        
        // Skip invalid image URLs
        if (imgSrc.startsWith('data:image/gif;base64,R0lGOD') || 
            imgSrc === 'data:,' || 
            imgSrc.includes('placeholder')) {
            console.log('ImageHover: Skipping placeholder image');
            return;
        }
        
        // Check image display size, skip preview if already large enough
        if (element.tagName === 'IMG' && element.naturalWidth > 0 && element.naturalHeight > 0) {
            const displayWidth = element.offsetWidth || element.width;
            const displayHeight = element.offsetHeight || element.height;
            const naturalWidth = element.naturalWidth;
            const naturalHeight = element.naturalHeight;
            
            // Don't show preview if display size is already 90%+ of natural size
            if (displayWidth >= naturalWidth * 0.9 && displayHeight >= naturalHeight * 0.9) {
                console.log('ImageHover: Image display size is already large enough', {
                    displaySize: { width: displayWidth, height: displayHeight },
                    naturalSize: { width: naturalWidth, height: naturalHeight },
                    ratio: { width: displayWidth / naturalWidth, height: displayHeight / naturalHeight }
                });
                return;
            }
        }
        
        const overlay = createOverlay();
        const overlayImg = overlay.querySelector('img');
        
        overlayImg.onload = function() {
            console.log('ImageHover: Image loaded successfully', {
                src: this.src,
                naturalWidth: this.naturalWidth,
                naturalHeight: this.naturalHeight,
                elementWidth: element.width,
                elementHeight: element.height
            });
            
            const naturalWidth = this.naturalWidth;
            const naturalHeight = this.naturalHeight;
            
            
            const position = calculatePosition(
                mouseEvent.clientX,
                mouseEvent.clientY,
                naturalWidth,
                naturalHeight
            );
            
            overlay.style.left = position.left + 'px';
            overlay.style.top = position.top + 'px';
            overlay.style.maxWidth = position.width + 'px';
            overlay.style.maxHeight = position.height + 'px';
            overlay.style.opacity = '1';
            
            console.log('ImageHover: Preview displayed', {
                position: position,
                overlayStyle: {
                    left: overlay.style.left,
                    top: overlay.style.top,
                    maxWidth: overlay.style.maxWidth,
                    maxHeight: overlay.style.maxHeight,
                    opacity: overlay.style.opacity
                }
            });
        };
        
        overlayImg.onerror = function() {
            console.log('ImageHover: Failed to load image', {
                src: this.src,
                error: 'Image load failed'
            });
            hidePreview();
        };
        
        overlayImg.src = imgSrc;
        currentImage = element;
    }
    
    function hidePreview() {
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                    overlay = null;
                }
            }, 200);
        }
        currentImage = null;
    }
    
    function handleMouseEnter(event) {
        const element = event.target;
        
        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        
        hoverTimer = setTimeout(() => {
            showPreview(element, event);
        }, HOVER_DELAY);
    }
    
    function handleMouseLeave(event) {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        
        if (currentImage === event.target) {
            hidePreview();
        }
    }
    
    function handleMouseMove(event) {
        if (overlay && overlay.style.opacity === '1' && currentImage) {
            const overlayImg = overlay.querySelector('img');
            if (overlayImg.complete) {
                const position = calculatePosition(
                    event.clientX,
                    event.clientY,
                    overlayImg.naturalWidth,
                    overlayImg.naturalHeight
                );
                
                overlay.style.left = position.left + 'px';
                overlay.style.top = position.top + 'px';
            }
        }
    }
    
    function isValidImageElement(element) {
        if (element.tagName === 'IMG') {
            // Check if there's a real image source
            const src = getImageSrc(element);
            return src && 
                   !src.startsWith('data:image/svg') && 
                   !src.startsWith('data:image/gif;base64,R0lGOD') &&
                   src !== 'data:,';
        }
        
        const bgImage = window.getComputedStyle(element).backgroundImage;
        return bgImage && bgImage !== 'none' && !bgImage.includes('data:image/svg');
    }
    
    async function initializeExtension() {
        // Check current domain's enabled status
        await checkIfEnabled();
        
        document.addEventListener('mouseover', function(event) {
            if (isValidImageElement(event.target)) {
                handleMouseEnter(event);
            }
        });
        
        document.addEventListener('mouseout', function(event) {
            if (isValidImageElement(event.target)) {
                handleMouseLeave(event);
            }
        });
        
        document.addEventListener('mousemove', handleMouseMove);
        
        document.addEventListener('scroll', hidePreview);
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        const images = node.querySelectorAll ? node.querySelectorAll('img, [style*="background-image"]') : [];
                        images.forEach(function(img) {
                            if (isValidImageElement(img)) {
                                img.addEventListener('mouseenter', handleMouseEnter);
                                img.addEventListener('mouseleave', handleMouseLeave);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }
})();
