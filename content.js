(function() {
    'use strict';
    
    let overlay = null;
    let currentImage = null;
    let hoverTimer = null;
    const HOVER_DELAY = 300;
    
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
            // 优先使用 data-src (懒加载)
            let src = element.dataset.src || element.getAttribute('data-src');
            if (!src) {
                src = element.src;
            }
            
            // 过滤占位符图片
            if (src && (
                src.startsWith('data:image/gif;base64,R0lGOD') ||
                src.startsWith('data:image/svg+xml') ||
                src === 'data:,' ||
                src.includes('placeholder')
            )) {
                // 尝试其他懒加载属性
                src = element.dataset.lazySrc || 
                      element.dataset.original || 
                      element.getAttribute('data-lazy-src') ||
                      element.getAttribute('data-original');
            }
            
            // 处理相对路径URL
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                if (src.startsWith('//')) {
                    src = window.location.protocol + src;
                } else if (src.startsWith('/')) {
                    src = window.location.origin + src;
                } else {
                    // 相对路径，基于当前页面URL
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
        
        const maxWidth = Math.min(imageWidth, viewportWidth * 0.8);
        const maxHeight = Math.min(imageHeight, viewportHeight * 0.8);
        
        // 对于 fixed 定位，直接使用视口坐标，不需要加滚动偏移
        let left = mouseX + 15;
        let top = mouseY + 15;
        
        // 确保预览框不超出视口边界
        if (left + maxWidth > viewportWidth - 20) {
            left = mouseX - maxWidth - 15;
        }
        
        if (top + maxHeight > viewportHeight - 20) {
            top = mouseY - maxHeight - 15;
        }
        
        // 确保不会超出视口左上角
        left = Math.max(10, left);
        top = Math.max(10, top);
        
        return { left, top, width: maxWidth, height: maxHeight };
    }
    
    function showPreview(element, mouseEvent) {
        const imgSrc = getImageSrc(element);
        
        // 调试信息 (可以通过控制台查看)
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
        
        // 跳过无效的图片URL
        if (imgSrc.startsWith('data:image/gif;base64,R0lGOD') || 
            imgSrc === 'data:,' || 
            imgSrc.includes('placeholder')) {
            console.log('ImageHover: Skipping placeholder image');
            return;
        }
        
        // 如果是相同的src且不需要放大，跳过
        if (element.tagName === 'IMG' && imgSrc === element.src && 
            element.naturalWidth > 0 && element.naturalWidth <= element.width) {
            console.log('ImageHover: Image does not need enlargement');
            return;
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
            
            // 只有当原图明显不比显示的大时才跳过
            if (naturalWidth <= element.width * 1.1 && naturalHeight <= element.height * 1.1) {
                console.log('ImageHover: Image not significantly larger than original, hiding preview');
                hidePreview();
                return;
            }
            
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
            // 检查是否有真实图片源
            const src = getImageSrc(element);
            return src && 
                   !src.startsWith('data:image/svg') && 
                   !src.startsWith('data:image/gif;base64,R0lGOD') &&
                   src !== 'data:,';
        }
        
        const bgImage = window.getComputedStyle(element).backgroundImage;
        return bgImage && bgImage !== 'none' && !bgImage.includes('data:image/svg');
    }
    
    function initializeExtension() {
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