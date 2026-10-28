const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// 1. AI Story Generate Karne Ka Rasta (Gemini)
app.post('/api/generate-story', async (req, res) => {
    const { topic } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

        try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, // यहाँ मॉडल बदला है
            {
                contents: [{ parts: [{ text: `Write a short engaging video script about: ${topic}` }] }]
            }
        );
        const storyText = response.data.candidates[0].content.parts[0].text;
        res.json({ success: true, result: storyText });
    } catch (error) {
        console.error("GEMINI ERROR:", error.response ? error.response.data : error.message); // ये रेंडर लॉग्स में असली एरर दिखाएगा
        res.status(500).json({ success: false, error: error.response ? error.response.data.error.message : "API Call Failed" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Story generate nahi ho payi." });
    }
});

// 2. AI Voice Generate Karne Ka Rasta (Sarvam AI)
app.post('/api/generate-voice', async (req, res) => {
    const { text, language } = req.body;
    const apiKey = process.env.SARVAM_API_KEY;

    try {
        const response = await axios.post(
            'https://api.sarvam.ai/text-to-speech',
            {
                inputs: [text],
                target_language_code: language, 
                speaker: "meera", 
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 8000,
                enable_preprocessing: true,
                model: "bulbul:v1"
            },
            { headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' } }
        );
        res.json({ success: true, audioBase64: response.data.audios[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: "Voice generate nahi ho payi." });
    }
});

// टेस्ट करने के लिए
app.get('/', (req, res) => {
    res.send("Backend server is running perfectly!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
