const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 引入檔案讀取模組
const path = require('path'); // 引入路徑處理模組
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 預先讀取你的知識庫檔案 (這樣不用每次請求都讀一次硬碟，效能比較好)
let knowledgeBase = "";
try {
    const kbPath = path.join(__dirname, 'my_knowledge_base.txt');
    // 如果檔案存在，讀取內容
    if (fs.existsSync(kbPath)) {
        knowledgeBase = fs.readFileSync(kbPath, 'utf-8');
        console.log("✅ 成功載入個人資料庫 (my_knowledge_base.txt)");
    } else {
        console.warn("⚠️ 找不到 my_knowledge_base.txt，AI 將僅使用基本設定。");
    }
} catch (err) {
    console.error("❌ 讀取資料庫時發生錯誤:", err);
}

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key not configured on server' });
    }

    try {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

        const systemPrompt = `
            你現在扮演「陳柔蓁 (Rou Zhen)」。
            
            以下是關於你的詳細背景資料與經歷 (Knowledge Base)：
            """
            ${knowledgeBase}
            """
            
            請遵守以下規則：
            1. 必須完全依照上面的資料來回答，不要捏造事實。
            2. 請用繁體中文，以第一人稱「我」來回答。
            3. 語氣要像個大學生：熱情、有禮貌、偶爾可以用一點表情符號。
            4. 如果使用者的問題在資料裡找不到答案，請回答：「這個部分我可能要再想一下，或是你可以寄信問我本人喔！」
            5. 回答請保持簡短（3-4句話），適合聊天室閱讀。
        `;

        const payload = {
            contents: [{
                parts: [{ text: systemPrompt + "\nUser asks: " + userMessage }]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            res.json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            console.error("Gemini Response Error:", data);
            res.json({ reply: "我暫時無法回答這個問題 (API Error)。" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Failed to fetch from Gemini' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});