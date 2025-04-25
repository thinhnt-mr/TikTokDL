const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // Cách gọi fetch cho Node.js v18+
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CORS cho phép frontend request tới
app.use(cors());

// Route test
app.get('/', (req, res) => {
    res.send('Server TikTok Downloader đang hoạt động!');
});

// API Proxy TikTok
app.get('/api/tiktok', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Thiếu URL video' });
    }

    try {
        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Lỗi khi kết nối tới Server!', error);
        res.status(500).json({ error: 'Lỗi khi kết nối Server!' });
    }
});

// Chạy server
app.listen(PORT, () => {
    console.log(`✅ Server proxy TikTok chạy tại http://localhost:${PORT}`);
});
