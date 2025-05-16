require('dotenv').config();
const admin = require('firebase-admin');
const firebaseKey = JSON.parse(process.env.FIREBASE_KEY);
admin.initializeApp({
    credential: admin.credential.cert(firebaseKey),
    databaseURL: 'https://comments-483c3-default-rtdb.firebaseio.com/'
});
const db = admin.database();
const commentsRef = db.ref('comments');
const fs = require('fs');
const path = require('path');
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CORS và route tĩnh
app.use(cors({
    origin: [
        'https://toksave.online',
        'https://thinhnt-mr.github.io',
        'https://cron-job.org'
    ]
}));
app.use(express.json());
app.use('/sitemap.xml', express.static('sitemap.xml'));
app.use('/robots.txt', express.static('robots.txt'));

const TIKWM_API = (process.env.TIKWM_API || 'https://tikwm.com/api').replace(/\/+$/, '');

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'TikTok Proxy Server is running',
        timestamp: new Date().toISOString()
    });
});

// TikTok proxy API
app.get('/api/tiktok', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'Thiếu URL video' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const apiUrl = `${TIKWM_API}/?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://tikwm.com/',
            },
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error(`API response status: ${response.status}`);

        const data = await response.json();
        res.json(data);
    } catch (error) {
        clearTimeout(timeout);
        console.error('Lỗi khi kết nối tới API Tikwm:', error);
        res.status(500).json({ error: 'Lỗi khi kết nối API', message: error.message });
    }
});

app.get('/api/download', async (req, res) => {
    const fileUrl = req.query.url;
    const filename = req.query.filename || 'download.mp4';

    if (!fileUrl) return res.status(400).send('Thiếu URL');

    try {
        const response = await fetch(fileUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!response.ok) {
            console.error('Lỗi khi fetch file:', response.status);
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

// API lấy bình luận
app.get('/api/comments', async (req, res) => {
    try {
        const snapshot = await commentsRef.once('value');
        const data = snapshot.val() || {};
        const comments = Object.values(data);
        res.json(comments);
    } catch (error) {
        console.error('Firebase read error:', error);
        res.status(500).json([]);
    }
});

// API lưu bình luận
app.post('/api/comments', async (req, res) => {
    const newComment = req.body;
    newComment.timestamp = Date.now(); // Đảm bảo có timestamp

    try {
        await commentsRef.push(newComment);
        res.status(201).json({ message: 'Bình luận đã được lưu!' });
    } catch (error) {
        console.error('Firebase write error:', error);
        res.status(500).json({ error: 'Không thể lưu bình luận' });
    }
});

// API like / dislike
app.post('/api/comments/reaction', async (req, res) => {
    const { timestamp, type } = req.body;

    try {
        const snapshot = await commentsRef.once('value');
        let foundKey = null;
        snapshot.forEach(child => {
            if (child.val().timestamp === timestamp) {
                foundKey = child.key;
            }
        });

        if (!foundKey) {
            return res.status(404).json({ error: 'Không tìm thấy bình luận' });
        }

        const commentRef = commentsRef.child(foundKey);
        const commentSnap = await commentRef.once('value');
        const comment = commentSnap.val();

        if (type === 'like') comment.likes = (comment.likes || 0) + 1;
        else comment.dislikes = (comment.dislikes || 0) + 1;

        await commentRef.update({ likes: comment.likes, dislikes: comment.dislikes });

        res.json({
            message: 'Đã cập nhật phản hồi',
            likes: comment.likes,
            dislikes: comment.dislikes
        });
    } catch (error) {
        console.error('Firebase update error:', error);
        res.status(500).json({ error: 'Không thể cập nhật phản hồi' });
    }
});

app.get('/api/placeholder/:width/:height', (req, res) => {
    const { width, height } = req.params;
    res.redirect(`https://via.placeholder.com/${width}x${height}`);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('🛑 Server tắt do SIGTERM');
    server.close(() => process.exit(0));
});