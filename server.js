require('dotenv').config();

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Đảm bảo URL API chuẩn, xóa dấu '/' thừa cuối nếu có
const TIKWM_API = (process.env.TIKWM_API || 'https://tikwm.com/api').replace(/\/+$/, '');

// Middleware CORS
app.use(cors({
    origin: 'https://thinhnt-mr.github.io',
}));

// API Proxy TikTok
app.get('/api/tiktok', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Thiếu URL video' });
    }

    try {
        // Ghép URL chắc chắn đúng
        const apiUrl = `${TIKWM_API}/?url=${encodeURIComponent(videoUrl)}`;
        console.log('Gọi API đến:', apiUrl); // Debug URL thực tế

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://tikwm.com/',
            },
        });

        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Lỗi khi kết nối tới API Tikwm:', error);
        res.status(500).json({ error: 'Lỗi khi kết nối API', message: error.message });
    }
});

// Endpoint placeholder images
app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    res.redirect(`https://via.placeholder.com/${width}x${height}`);
});

// Phục vụ file tĩnh nếu cần
app.use(express.static('public'));

// Chạy server
app.listen(PORT, () => {
    console.log(`✅ Server proxy TikTok đang chạy tại http://localhost:${PORT}`);
});