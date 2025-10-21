// list_models.js

// 1. 載入必要的套件
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); // 這樣才能讀取 .env 檔案中的 API 金鑰

// 2. 檢查 API 金鑰是否存在
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("錯誤：找不到 GEMINI_API_KEY。請檢查你的 .env 檔案是否設定正確。");
  process.exit(1); // 結束程式
}

// 3. 初始化 genAI
const genAI = new GoogleGenerativeAI(apiKey);

// 4. 建立一個非同步函式來獲取並印出模型列表
async function listAvailableModels() {
  console.log("正在連線到 Google AI，請稍候...");
  console.log("-----------------------------------------");

  try {
    // 獲取模型列表
    const result = await genAI.listModels();

    console.log("✅ 成功獲取模型列表！\n");
    console.log("以下是你的 API 金鑰可以使用的模型：\n");

    // 迴圈印出每個模型的資訊
    for await (const model of result) {
      // 我們只關心支援 'generateContent' (生成內容) 的模型
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- 模型名稱 (Model Name): ${model.name}`);
        console.log(`  顯示名稱 (Display Name): ${model.displayName}`);
        console.log(`  (描述: ${model.description.substring(0, 50)}...)\n`);
      }
    }
    console.log("-----------------------------------------");
    console.log("請從上面的「模型名稱 (Model Name)」中，挑選一個複製到你的 server.js 檔案裡。");
    console.log("我推薦使用 'gemini-1.5-flash' (如果有的話)。");

  } catch (error) {
    console.error("❌ 獲取模型列表時發生錯誤：");
    console.error(error);
  }
}

// 5. 執行這個函式
listAvailableModels();