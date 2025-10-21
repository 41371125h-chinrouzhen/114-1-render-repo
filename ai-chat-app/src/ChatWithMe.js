import React, { useState, useEffect, useRef } from 'react';
import './ChatWithMe.css';

function ChatWithMe() {
    const [messages, setMessages] = useState([
        { role: 'model', text: '嗨！我是虛擬陳柔蓁，很高興認識你。你可以問我關於我的專案、技能或興趣喔！' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault(); // 防止表單提交時頁面重新整理
        if (!userInput.trim() || isLoading) return; 

        const newMessages = [...messages, { role: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput(''); 
        setIsLoading(true); 

        try {
            const historyForAPI = newMessages
              .slice(0, -1)
              .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
              }));

            const response = await fetch('https://hw3-virtual-me-backend.onrender.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    history: historyForAPI,
                    message: userInput,
                }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'model', text: data.message }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: '抱歉，我現在好像有點問題，請稍後再試。' }]);
        } finally {
            setIsLoading(false); // 結束等待狀態
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
                {isLoading && <div className="message model"><p>正在輸入中...</p></div>}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="跟虛擬陳柔蓁聊聊吧..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    傳送
                </button>
            </form>
        </div>
    );
}

export default ChatWithMe;