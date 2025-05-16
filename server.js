const path = require('path');
require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');

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

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Đã kết nối MongoDB'))
    .catch(err => {
        console.error('❌ Kết nối MongoDB thất bại:', err);
        process.exit(1);
    });

const commentSchema = new mongoose.Schema({
    userName: String,
    text: String,
    rating: Number,
    timestamp: Number,
    avatar: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
});

const Comment = mongoose.model('Comment', commentSchema);

app.use(express.json()); // Cho phép đọc body JSON

// Lấy tất cả bình luận
app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ timestamp: -1 });
        res.json(comments);
    } catch (err) {
        console.error('Lỗi khi lấy bình luận:', err);
        res.status(500).json({ error: 'Không thể lấy bình luận' });
    }
});
app.post('/api/comments', async (req, res) => {
    try {
        const newComment = new Comment(req.body);
        await newComment.save();
        res.status(201).json({ message: 'Bình luận đã được lưu!' });
    } catch (err) {
        console.error('Lỗi khi lưu bình luận:', err);
        res.status(500).json({ error: 'Không thể lưu bình luận' });
    }
});
app.post('/api/comments/reaction', async (req, res) => {
    const { timestamp, type } = req.body;

    if (!timestamp || !['like', 'dislike'].includes(type)) {
        return res.status(400).json({ error: 'Thiếu hoặc sai tham số' });
    }

    try {
        const update = type === 'like' ? { $inc: { likes: 1 } } : { $inc: { dislikes: 1 } };
        const comment = await Comment.findOneAndUpdate({ timestamp }, update, { new: true });

        if (!comment) {
            return res.status(404).json({ error: 'Không tìm thấy bình luận' });
        }

        res.json({ message: 'Đã cập nhật phản hồi', likes: comment.likes, dislikes: comment.dislikes });
    } catch (err) {
        console.error('Lỗi khi cập nhật phản hồi:', err);
        res.status(500).json({ error: 'Lỗi server khi cập nhật phản hồi' });
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