const path = require('path');
require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const axios = require("axios");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
// Phục vụ file tĩnh nếu cần
app.use(express.static('public'));

const RECAPTCHA_SECRET_KEY = "6LcRiScrAAAAAOXZfLjYIwEFdEnbDXQ-Oo8Fwcaf";

// Route xử lý form
app.post("/submit-form", async (req, res) => {
    const { name, email, content, "g-recaptcha-response": captchaToken } = req.body;

    // Kiểm tra CAPTCHA với Google
    try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
        const captchaResponse = await axios.post(verifyUrl);

        if (!captchaResponse.data.success) {
            return res.status(400).json({
                success: false,
                message: "CAPTCHA không hợp lệ. Vui lòng thử lại!"
            });
        }

        // Xử lý dữ liệu form ở đây (lưu vào DB, gửi email, etc.)
        console.log("Dữ liệu hợp lệ:", { name, email, content });

        res.json({
            success: true,
            message: "Form đã được gửi thành công!"
        });

    } catch (error) {
        console.error("Lỗi xác minh CAPTCHA:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xử lý CAPTCHA"
        });
    }
});

// Đảm bảo URL API chuẩn, xóa dấu '/' thừa cuối nếu có
app.use('/sitemap.xml', express.static('sitemap.xml'));
app.use('/robots.txt', express.static('robots.txt'));
const TIKWM_API = (process.env.TIKWM_API || 'https://tikwm.com/api').replace(/\/+$/, '');

// Middleware CORS
app.use(cors({
    origin: [
        'https://toksave.online',
        'https://thinhnt-mr.github.io',
        'https://cron-job.org'
    ]
}));

// Thêm route này vào server.js
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'TikTok Proxy Server is running',
        timestamp: new Date().toISOString()
    });
});

// Sửa lại phần API TikTok proxy
app.get('/api/tiktok', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Thiếu URL video' });
    }

    // Thêm timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 8000); // 8 giây timeout

    try {
        const apiUrl = `${TIKWM_API}/?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://tikwm.com/',
            },
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API response status: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        clearTimeout(timeout);
        console.error('Lỗi khi kết nối tới API Tikwm:', error);
        res.status(500).json({
            error: 'Lỗi khi kết nối API',
            message: error.message
        });
    }
});

// Endpoint placeholder images
app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    res.redirect(`https://via.placeholder.com/${width}x${height}`);
});

// Chạy server
const server = app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('🛑 Server tắt do SIGTERM');
    server.close(() => process.exit(0));
});