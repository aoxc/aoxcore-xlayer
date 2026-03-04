// server.js (Node.js + Express)
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors()); // Sadece senin frontend URL'ine izin verecek şekilde kısıtlayabilirsin
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/analyze', async (req, res) => {
    try {
        // 1. Gelen isteği doğrula (Opsiyonel: Kullanıcı yetkisi kontrolü)
        const { prompt, context } = req.body;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // 2. Gemini ile güvenli köprü kur
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // 3. Yanıtı JSON olarak dön
        res.json(JSON.parse(response));
    } catch (error) {
        console.error("SECURE_BRIDGE_ERROR:", error);
        res.status(500).json({ risk: 100, action: "REJECT", reason: "Backend Security Breach" });
    }
});

app.listen(5000, () => console.log('🛡️  AOXC Secure Vault running on port 5000'));
