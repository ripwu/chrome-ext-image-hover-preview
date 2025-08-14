document.addEventListener('DOMContentLoaded', async function() {
    const toggle = document.getElementById('toggle');
    const currentSiteElement = document.getElementById('currentSite');
    const statusElement = document.getElementById('status');
    
    try {
        // Get current tab information
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);
        const hostname = url.hostname;
        
        currentSiteElement.textContent = hostname;
        
        // Get current site's disabled status from storage
        const result = await chrome.storage.local.get([`disabled_${hostname}`]);
        const isDisabled = result[`disabled_${hostname}`] || false;
        
        // Set toggle state (note: this is an "enable" toggle, so we need to invert)
        const isEnabled = !isDisabled;
        updateToggleState(isEnabled);
        updateStatus(isEnabled);
        
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
});