const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const axios = require("axios");
const oneYear = 31536000000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/verify-captcha", async (req, res) => {
    const recaptchaToken = req.body["g-recaptcha-response"];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!recaptchaToken) {
        return res.json({ success: false, message: "Vui lòng xác nhận CAPTCHA" });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: secretKey,
                    response: recaptchaToken
                }
            }
        );

        if (response.data.success) {
            res.json({ success: true, message: "CAPTCHA hợp lệ!" });
        } else {
            res.json({ success: false, message: "Xác thực CAPTCHA thất bại!" });
        }

    } catch (err) {
        res.json({ success: false, message: "Có lỗi khi kiểm tra CAPTCHA!" });
    }
});

app.use(express.static('public', {
    maxAge: oneYear,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000000, immutable');
        }
    }
}));

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

// Thêm proxy endpoint để phục vụ video
app.get('/proxy/video/:type', async (req, res) => {
    const videoUrl = req.query.url;
    const type = req.params.type; // Loại: nowm, wm, audio, cover

    if (!videoUrl) {
        return res.status(400).send('Missing URL parameter');
    }

    try {
        const response = await axios({
            method: 'get',
            url: videoUrl,
            responseType: 'stream'
        });

        // Set Content-Type header based on type
        if (type === 'audio') {
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', 'attachment; filename="tiktok-audio.mp3"');
        } else if (type === 'cover') {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Disposition', 'attachment; filename="tiktok-cover.jpg"');
        } else {
            res.setHeader('Content-Type', 'video/mp4');
            const filename = type === 'wm' ? 'tiktok-with-watermark.mp4' : 'tiktok-no-watermark.mp4';
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        // Forward all headers from the source
        for (const [key, value] of Object.entries(response.headers)) {
            if (key.toLowerCase() !== 'content-type' && key.toLowerCase() !== 'content-disposition') {
                res.setHeader(key, value);
            }
        }

        // Pipe the response stream to our response
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error proxying content');
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