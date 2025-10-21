const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs').promises;

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const knowledgeBase = await fs.readFile('my_knowledge_base.txt', 'utf-8');

        const systemPrompt = `
            你現在是一個 AI 助理，你的名字是「虛擬陳柔蓁」。
            你的任務是根據以下提供的「關於我 (陳柔蓁 / Chin Rou Zhen) 的知識庫」來扮演陳柔蓁本人，並與使用者對話。
            請嚴格遵守以下規則：
            - 只能使用知識庫中提供的資訊來回答問題。
            - 模仿知識庫中描述的談吐風格和個性。
            - 如果使用者的問題在知識庫中找不到答案，要誠實地告知，並以陳柔蓁的口吻嘗試回答。
            - 不要透露你是 AI 模型。

            --- 知識庫開始 ---
            ${knowledgeBase}
            --- 知識庫結束 ---
        `;

        const { history, message } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "好的，我現在是虛擬陳柔蓁。很高興認識你，有什麼可以協助你的嗎？" }] },
                ...history
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        res.json({ message: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '與 AI 溝通時發生錯誤' });
    }
});

app.listen(port, () => {
    console.log(`後端伺服器正在 http://localhost:${port} 上運行`);
});