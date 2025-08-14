document.addEventListener('DOMContentLoaded', async function() {
    const toggle = document.getElementById('toggle');
    const currentSiteElement = document.getElementById('currentSite');
    const statusElement = document.getElementById('status');
    
    try {
        // 获取当前标签页信息
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);
        const hostname = url.hostname;
        
        currentSiteElement.textContent = hostname;
        
        // 从存储中获取当前网站的禁用状态
        const result = await chrome.storage.local.get([`disabled_${hostname}`]);
        const isDisabled = result[`disabled_${hostname}`] || false;
        
        // 设置开关状态（注意：这里是"启用"开关，所以要取反）
        const isEnabled = !isDisabled;
        updateToggleState(isEnabled);
        updateStatus(isEnabled);
        
        // 开关点击事件
        toggle.addEventListener('click', async function() {
            const currentState = toggle.classList.contains('active');
            const newState = !currentState;
            
            // 更新UI
            updateToggleState(newState);
            updateStatus(newState);
            
            // 保存到存储（保存的是禁用状态）
            await chrome.storage.local.set({
                [`disabled_${hostname}`]: !newState
            });
            
            // 通知content script状态变更
            try {
                await chrome.tabs.sendMessage(currentTab.id, {
                    action: 'togglePreview',
                    enabled: newState,
                    hostname: hostname
                });
            } catch (error) {
                console.log('无法发送消息到content script，可能页面需要刷新');
                statusElement.textContent = '设置已保存，刷新页面后生效';
                statusElement.style.color = '#ff6b35';
            }
        });
        
    } catch (error) {
        console.error('Error in popup:', error);
        currentSiteElement.textContent = '无法获取网站信息';
        statusElement.textContent = '发生错误，请重试';
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
            statusElement.textContent = '预览功能已启用';
            statusElement.style.color = '#4CAF50';
        } else {
            statusElement.textContent = '预览功能已禁用';
            statusElement.style.color = '#ff6b35';
        }
    }
});