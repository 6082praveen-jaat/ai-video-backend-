const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const AGNES_API_KEY = process.env.AGNES_API_KEY;

// 1. AI Story (Gemini)
app.post('/api/generate-story', async (req, res) => {
    const { topic } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            { contents: [{ parts: [{ text: `Write a short engaging video script about: ${topic}` }] }] }
        );
        const storyText = response.data.candidates[0].content.parts[0].text;
        res.json({ success: true, result: storyText });
    } catch (error) {
        res.status(500).json({ success: false, error: "Story failed." });
    }
});

// 2. Video Generate (Agnes AI)
app.post('/api/generate-video', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await axios.post('https://apihub.agnes-ai.com/v1/videos', {
            model: "agnes-video-2.5-flash",
            prompt: prompt,
            seconds: "5",
            mode: "text",
            size: "720P",
            aspect_ratio: "16:9"
        }, {
            headers: {
                'Authorization': `Bearer ${AGNES_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({ success: true, taskId: response.data.video_id });
    } catch (error) {
        console.error("Agnes Error:", error.message);
        res.status(500).json({ success: false, error: "Video task fail." });
    }
});

// 3. Video Status Check (Agnes AI)
app.get('/api/video-status/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        const response = await axios.get(`https://apihub.agnes-ai.com/agnesapi?video_id=${taskId}&model_name=agnes-video-2.5-flash`, {
            headers: { 'Authorization': `Bearer ${AGNES_API_KEY}` }
        });
        const videoData = response.data;

        if (videoData.status === 'completed') {
            res.json({ success: true, status: "completed", videoUrl: videoData.url });
        } else {
            res.json({ success: true, status: "processing" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Status check fail." });
    }
});

// 4. Voice (Sarvam)
app.post('/api/generate-voice', async (req, res) => {
    const { text, language } = req.body;
    const apiKey = process.env.SARVAM_API_KEY;
    try {
        const response = await axios.post(
            'https://api.sarvam.ai/text-to-speech',
            { inputs: [text], target_language_code: language, speaker: "meera", model: "bulbul:v1" },
            { headers: { 'api-subscription-key': apiKey } }
        );
        res.json({ success: true, audioBase64: response.data.audios[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: "Voice failed." });
    }
});

app.get('/', (req, res) => { res.send("Backend is running!"); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
