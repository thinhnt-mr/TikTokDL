const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Phục vụ file tĩnh như index.html, style.css...
app.use(express.static('public'));

// Route test
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Cache mạnh cho CSS/JS/Ảnh (1 năm) + không cache HTML
app.use(express.static('public', {
    setHeaders: (res, path) => {
        if (path.match(/\.(html|htm)$/)) {
            res.set('Cache-Control', 'no-store'); // Không cache HTML
        } else if (path.match(/\.(css|js|png|jpg|webp)$/)) {
            res.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 năm
        }
    }
}));

// Proxy API TikTok
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