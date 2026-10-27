const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-video', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        // फिलहाल टेस्टिंग के लिए एक डमी वीडियो भेज रहे हैं
        // बाद में यहाँ असली API कॉल आएगी
        res.json({ 
            success: true, 
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate video" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
