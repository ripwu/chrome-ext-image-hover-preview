document.addEventListener('DOMContentLoaded', async function() {
    const toggle = document.getElementById('toggle');
    const currentSiteElement = document.getElementById('currentSite');
    const statusElement = document.getElementById('status');
    const maxSizeInput = document.getElementById('maxSizeInput');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValueDisplay = document.getElementById('sizeValueDisplay');
    
    // Size configuration constants
    const MIN_SIZE = 20;
    const MAX_SIZE = 100;
    const DEFAULT_SIZE = 80;
    
    let isUpdatingUI = false; // Prevent infinite loops during UI updates
    let currentTab = null;
    let saveDebounceTimer = null; // Debounce timer for saving
    
    try {
        // Get current tab information
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tabs[0];
        const url = new URL(currentTab.url);
        const hostname = url.hostname;
        
        currentSiteElement.textContent = hostname;
        
        // Get current site's disabled status and size settings from storage
        console.log('Loading settings for hostname:', hostname);
        const result = await chrome.storage.local.get([`disabled_${hostname}`, 'previewMaxSize']);
        console.log('Raw storage result:', result);
        
        const isDisabled = result[`disabled_${hostname}`] || false;
        let maxSize = result['previewMaxSize'];
        
        // Validate and set default for maxSize
        if (typeof maxSize !== 'number' || isNaN(maxSize) || maxSize < MIN_SIZE || maxSize > MAX_SIZE) {
            console.log(`Invalid or missing maxSize, using default ${DEFAULT_SIZE}:`, maxSize);
            maxSize = DEFAULT_SIZE;
            // Save the default value
            await chrome.storage.local.set({ 'previewMaxSize': DEFAULT_SIZE });
        }
        
        console.log('Final settings - isDisabled:', isDisabled, 'maxSize:', maxSize);
        
        // Set toggle state (note: this is an "enable" toggle, so we need to invert)
        const isEnabled = !isDisabled;
        updateToggleState(isEnabled);
        updateStatus(isEnabled);
        
        // Configure size input constraints
        sizeSlider.min = MIN_SIZE;
        sizeSlider.max = MAX_SIZE;
        sizeSlider.value = DEFAULT_SIZE;
        
        maxSizeInput.min = MIN_SIZE;
        maxSizeInput.max = MAX_SIZE;
        maxSizeInput.value = DEFAULT_SIZE;
        maxSizeInput.placeholder = `${MIN_SIZE}-${MAX_SIZE}`;
        
        // Initialize size settings
        console.log('Initializing with saved max size:', maxSize);
        updateSizeSettings(maxSize);
        
        // Toggle click event
        toggle.addEventListener('click', async function() {
            const currentState = toggle.classList.contains('active');
            const newState = !currentState;
            
            // Update UI
            updateToggleState(newState);
            updateStatus(newState);
            
            // Save to storage (saving disabled state)
            await chrome.storage.local.set({
                [`disabled_${hostname}`]: !newState
            });
            
            // Notify content script of state change
            try {
                await chrome.tabs.sendMessage(currentTab.id, {
                    action: 'togglePreview',
                    enabled: newState,
                    hostname: hostname
                });
            } catch (error) {
                console.log('Unable to send message to content script, page may need refresh');
                statusElement.textContent = 'Settings saved, refresh page to take effect';
                statusElement.style.color = '#ff6b35';
            }
        });
        
        // Slider change events
        sizeSlider.addEventListener('input', function() {
            const size = parseInt(this.value);
            console.log('Slider input event, size:', size);
            updateSizeImmediate(size, 'slider-drag');
        });
        
        sizeSlider.addEventListener('change', async function() {
            const size = parseInt(this.value);
            console.log('Slider change event, size:', size);
            await updateSize(size, 'slider-release');
        });
        
        // Manual input events
        maxSizeInput.addEventListener('input', function() {
            if (isUpdatingUI) {
                console.log('Skipping input event during UI update');
                return;
            }
            console.log('Manual input event triggered, raw value:', this.value);
            const rawSize = parseInt(this.value);
            if (!isNaN(rawSize)) {
                const clampedSize = clampSize(rawSize);
                console.log('Calling updateSizeImmediate from input event with clamped size:', clampedSize);
                updateSizeImmediate(clampedSize, 'input');
            }
        });
        
        maxSizeInput.addEventListener('change', async function() {
            if (isUpdatingUI) {
                console.log('Skipping change event during UI update');
                return;
            }
            console.log('Manual change event triggered, raw value:', this.value);
            const rawSize = parseInt(this.value);
            if (!isNaN(rawSize)) {
                const clampedSize = clampSize(rawSize);
                console.log('Calling updateSize from change event with clamped size:', clampedSize);
                await updateSize(clampedSize, 'change');
            }
        });
        
        maxSizeInput.addEventListener('blur', async function() {
            if (isUpdatingUI) {
                console.log('Skipping blur event during UI update');
                return;
            }
            console.log('Manual blur event triggered, raw value:', this.value);
            const rawSize = parseInt(this.value);
            if (!isNaN(rawSize)) {
                const clampedSize = clampSize(rawSize);
                console.log('Calling updateSize from blur event with clamped size:', clampedSize);
                await updateSize(clampedSize, 'blur');
            }
        });
        
        maxSizeInput.addEventListener('keypress', async function(e) {
            if (e.key === 'Enter') {
                if (isUpdatingUI) {
                    console.log('Skipping enter event during UI update');
                    return;
                }
                console.log('Enter key pressed, raw value:', this.value);
                const rawSize = parseInt(this.value);
                if (!isNaN(rawSize)) {
                    const clampedSize = clampSize(rawSize);
                    console.log('Calling updateSize from Enter key with clamped size:', clampedSize);
                    await updateSize(clampedSize, 'enter');
                }
            }
        });
        
    } catch (error) {
        console.error('Error in popup:', error);
        currentSiteElement.textContent = 'Unable to get site information';
        statusElement.textContent = 'Error occurred, please try again';
        statusElement.style.color = '#ff6b35';
    }
    
    function updateToggleState(enabled) {
        if (enabled) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }
    
    function updateStatus(enabled) {
        if (enabled) {
            statusElement.textContent = 'Preview enabled';
            statusElement.style.color = '#4CAF50';
        } else {
            statusElement.textContent = 'Preview disabled';
            statusElement.style.color = '#ff6b35';
        }
    }
    
    // Helper function to clamp size within valid range
    function clampSize(size) {
        const numSize = parseInt(size);
        if (isNaN(numSize)) {
            console.log('Invalid size, using default:', DEFAULT_SIZE);
            return DEFAULT_SIZE;
        }
        
        if (numSize < MIN_SIZE) {
            console.log(`Size ${numSize} below minimum, clamping to ${MIN_SIZE}`);
            return MIN_SIZE;
        }
        
        if (numSize > MAX_SIZE) {
            console.log(`Size ${numSize} above maximum, clamping to ${MAX_SIZE}`);
            return MAX_SIZE;
        }
        
        return numSize;
    }
    
    function updateSizeSettings(size, skipInputUpdate = false) {
        console.log('updateSizeSettings called with:', size, 'skipInputUpdate:', skipInputUpdate);
        console.log('Before update - input value:', maxSizeInput.value, 'slider value:', sizeSlider.value);
        
        isUpdatingUI = true;
        
        if (!skipInputUpdate) {
            maxSizeInput.value = size;
        }
        sizeSlider.value = size;
        sizeValueDisplay.textContent = size + '%';
        
        console.log('After update - input value:', maxSizeInput.value, 'slider value:', sizeSlider.value, 'display:', sizeValueDisplay.textContent);
        
        // Small delay to ensure all events are processed
        setTimeout(() => {
            isUpdatingUI = false;
            console.log('UI update lock released');
        }, 50);
    }
    
    function updateSizeImmediate(size, source = 'unknown') {
        console.log('updateSizeImmediate called with:', size, 'source:', source);
        
        // Update UI immediately without saving
        const skipInputUpdate = (source === 'input');
        updateSizeSettings(size, skipInputUpdate);
        
        // Debounce the save operation
        if (saveDebounceTimer) {
            clearTimeout(saveDebounceTimer);
        }
        
        saveDebounceTimer = setTimeout(async () => {
            console.log('Debounced save triggered for size:', size);
            await saveSizeSetting(size, currentTab.id);
        }, 300); // 300ms debounce
    }
    
    async function updateSize(size, source = 'unknown') {
        console.log('updateSize called with:', size, 'type:', typeof size, 'source:', source);
        
        // Update UI elements (skip input update if source is manual input to prevent cursor jumping)
        const skipInputUpdate = (source === 'input');
        updateSizeSettings(size, skipInputUpdate);
        
        // Save immediately (no debounce for explicit actions like blur/enter/slider release)
        await saveSizeSetting(size, currentTab.id);
        console.log('Size updated successfully from source:', source);
    }
    
    async function saveSizeSetting(size, tabId) {
        try {
            console.log('Saving size to storage:', size, 'type:', typeof size);
            
            // Ensure size is a number
            const numSize = parseInt(size);
            if (isNaN(numSize) || numSize < MIN_SIZE || numSize > MAX_SIZE) {
                console.error('Invalid size value:', size);
                return false;
            }
            
            // Save to storage with timeout
            const savePromise = chrome.storage.local.set({ 'previewMaxSize': numSize });
            await Promise.race([
                savePromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 3000))
            ]);
            
            console.log('Size saved to storage successfully');
            
            // Verify storage immediately
            const verification = await chrome.storage.local.get(['previewMaxSize']);
            console.log('Storage verification - saved:', numSize, 'retrieved:', verification.previewMaxSize);
            
            if (verification.previewMaxSize !== numSize) {
                console.error('Storage verification failed!');
                return false;
            }
            
            // Notify content script of size change
            try {
                await chrome.tabs.sendMessage(tabId, {
                    action: 'updateSize',
                    maxSize: numSize
                });
                console.log('Content script notified successfully');
            } catch (error) {
                console.log('Unable to send message to content script:', error.message);
                // Don't fail the entire operation if messaging fails
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save size setting:', error);
            return false;
        }
    }
});
