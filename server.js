require('dotenv').config();
const fs = require('fs');
const commentsFilePath = path.join(__dirname, 'comments.json');
const path = require('path');
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/api/download', async (req, res) => {
    const fileUrl = req.query.url;
    const filename = req.query.filename || 'download.mp4';

    if (!fileUrl) return res.status(400).send('Thiếu URL');

    try {
        const response = await fetch(fileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0', // Quan trọng
            }
        });

        if (!response.ok) {
            console.error('Lỗi khi fetch file:', response.status, await response.text());
            return res.status(500).send('Không thể tải file');
        }

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        response.body.pipe(res);
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).send('Lỗi server');
    }
});

app.use(express.json()); // Cho phép đọc body JSON

app.get('/api/comments', (req, res) => {
    fs.readFile(commentsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Lỗi đọc file bình luận:', err);
            return res.json([]);
        }
        try {
            const comments = JSON.parse(data || '[]');
            res.json(comments);
        } catch (parseErr) {
            console.error('Lỗi parse file:', parseErr);
            res.json([]);
        }
    });
});
// Lưu bình luận mới
app.post('/api/comments', (req, res) => {
    const newComment = req.body;

    fs.readFile(commentsFilePath, 'utf8', (err, data) => {
        let comments = [];
        if (!err && data) {
            try {
                comments = JSON.parse(data);
            } catch (parseErr) {
                console.error('Lỗi parse file:', parseErr);
            }
        }

        comments.push(newComment);

        fs.writeFile(commentsFilePath, JSON.stringify(comments, null, 2), err => {
            if (err) {
                console.error('Lỗi ghi bình luận:', err);
                return res.status(500).json({ error: 'Không thể lưu bình luận' });
            }
            res.status(201).json({ message: 'Bình luận đã được lưu!' });
        });
    });
});
// Like / Dislike
app.post('/api/comments/reaction', (req, res) => {
    const { timestamp, type } = req.body;

    if (!timestamp || !['like', 'dislike'].includes(type)) {
        return res.status(400).json({ error: 'Thiếu hoặc sai tham số' });
    }

    fs.readFile(commentsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Lỗi đọc file:', err);
            return res.status(500).json({ error: 'Không thể đọc dữ liệu' });
        }

        let comments = [];
        try {
            comments = JSON.parse(data);
        } catch (parseErr) {
            console.error('Lỗi parse:', parseErr);
            return res.status(500).json({ error: 'Dữ liệu bị hỏng' });
        }

        const index = comments.findIndex(c => c.timestamp === timestamp);
        if (index === -1) return res.status(404).json({ error: 'Không tìm thấy bình luận' });

        if (type === 'like') comments[index].likes = (comments[index].likes || 0) + 1;
        else comments[index].dislikes = (comments[index].dislikes || 0) + 1;

        fs.writeFile(commentsFilePath, JSON.stringify(comments, null, 2), err => {
            if (err) {
                console.error('Lỗi ghi lại file:', err);
                return res.status(500).json({ error: 'Không thể cập nhật phản hồi' });
            }

            res.json({
                message: 'Đã cập nhật phản hồi',
                likes: comments[index].likes,
                dislikes: comments[index].dislikes
            });
        });
    });
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