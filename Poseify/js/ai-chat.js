/* js/ai-chat.js */
const BACKEND_URL = "https://one14-1-portfolio.onrender.com/api/chat"; 

const chatContainer = document.getElementById('virtual-me-root');

function initChat() {
    // 檢查容器是否存在，避免在其他頁面報錯
    if (!chatContainer) return;

    chatContainer.innerHTML = `
        <div class="card border-0" style="height: 500px; display: flex; flex-direction: column;">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span><i class="fa-solid fa-robot me-2"></i>Virtual Rou Zhen</span>
                <span class="badge bg-light text-dark">Online</span>
            </div>
            <div id="chat-history" class="card-body bg-light" style="flex: 1; overflow-y: auto; padding: 20px;">
                <div class="d-flex flex-column align-items-start mb-3">
                    <div class="bg-white p-3 rounded shadow-sm text-dark" style="max-width: 80%;">
                        哈囉！我是柔蓁的 AI 分身。我現在透過雲端伺服器運作，更安全也更聰明喔！你可以問我任何關於我的問題。
                    </div>
                </div>
            </div>
            <div class="card-footer bg-white">
                <div class="input-group">
                    <input type="text" id="user-input" class="form-control border-0" placeholder="Type a message..." onkeypress="handleEnter(event)">
                    <button class="btn btn-primary" onclick="sendMessage()"><i class="fa fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
}

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const userText = inputField.value.trim();

    if (!userText) return;

    appendMessage('end', 'bg-primary text-white', userText);
    inputField.value = '';

    const loadingId = 'loading-' + Date.now();
    appendMessage('start', 'bg-white text-dark', '<i class="fa-solid fa-ellipsis fa-fade"></i> Thinking...', loadingId);

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });

        const data = await response.json();
        
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        if (data.reply) {
            appendMessage('start', 'bg-white text-dark', data.reply);
        } else {
            appendMessage('start', 'bg-danger text-white', '伺服器沒有回應。');
        }

    } catch (error) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        appendMessage('start', 'bg-warning text-dark', '連線中...請稍等 (Render 休眠喚醒需時約 1 分鐘)');
        console.error(error);
    }
}

function appendMessage(align, cssClass, text, id = null) {
    const history = document.getElementById('chat-history');
    const msgDiv = document.createElement('div');
    msgDiv.className = `d-flex flex-column align-items-${align} mb-3`;
    if (id) msgDiv.id = id;
    
    const formattedText = text.replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
        <div class="${cssClass} p-3 rounded shadow-sm" style="max-width: 80%;">
            ${formattedText}
        </div>
    `;
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
}

document.addEventListener('DOMContentLoaded', initChat);