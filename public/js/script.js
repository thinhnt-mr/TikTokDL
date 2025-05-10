document.addEventListener('DOMContentLoaded', function () {
    const videoUrlInput = document.getElementById('video-url');
    const downloadBtn = document.getElementById('download-btn');
    const result = document.getElementById('result');
    const loading = document.querySelector('.loading');
    const errorMessage = document.getElementById('error-message');
    const videoThumbnail = document.getElementById('video-thumbnail');
    const downloadNoWatermark = document.getElementById('download-no-watermark');
    const downloadWithWatermark = document.getElementById('download-with-watermark');
    const downloadAudio = document.getElementById('download-audio');
    const downloadCover = document.getElementById('downloadCover');
    // Xử lý tải video
    downloadBtn.addEventListener('click', async function () {
        const url = videoUrlInput.value.trim();
        if (!url || !url.startsWith('http') || !url.includes('tiktok.com')) {
            alert('Vui lòng nhập URL hợp lệ của TikTok');
            return;
        }
        loading.style.display = 'block';
        errorMessage.style.display = 'none';
        result.style.display = 'none';
        // Xóa thông tin profile cũ nếu có
        const existingProfile = document.getElementById('user-profile');
        if (existingProfile) {
            existingProfile.style.display = 'none';
        }
        try {
            const videoData = await downloadTikTokVideo(url);
            loading.style.display = 'none';
            if (videoData && videoData.data) {
                displayUserProfile(videoData.data);
                // Set video thumbnail
                videoThumbnail.src = videoData.data.cover || '/api/placeholder/350/500';
                videoThumbnail.alt = 'Video Thumbnail';
                // Setup download buttons
                setupDownloadButton(downloadNoWatermark, videoData.data.play, 'tiktok-no-watermark.mp4');
                setupDownloadButton(downloadWithWatermark, videoData.data.wmplay, 'tiktok-with-watermark.mp4');
                setupDownloadButton(downloadAudio, videoData.data.music, 'tiktok-audio.mp3');
                // Đảm bảo downloadCover được định nghĩa trước khi sử dụng
                if (downloadCover) {
                    setupDownloadButton(downloadCover, videoData.data.cover, 'tiktok-cover.jpg');
                }
                result.style.display = 'block';
            } else {
                errorMessage.textContent = videoData.message || 'Không thể tải video. Vui lòng kiểm tra URL và thử lại.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Lỗi:', error);
            loading.style.display = 'none';
            errorMessage.textContent = 'Đã xảy ra lỗi khi kết nối với API. Vui lòng thử lại sau.';
            errorMessage.style.display = 'block';
        }
    });
    // Thiết lập button tải
    function setupDownloadButton(button, url, filename) {
        if (!button) return;
        if (url) {
            button.onclick = e => {
                e.preventDefault();
                downloadVideo(url, filename);
            };
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
        } else {
            button.style.opacity = '0.5';
            button.style.pointerEvents = 'none';
        }
    }
    // Escape HTML để chống XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        }[char]));
    }
    // Hiển thị profile người dùng
    function displayUserProfile(data) {
        let profileContainer = document.getElementById('user-profile');
        if (!profileContainer) {
            profileContainer = document.createElement('div');
            profileContainer.id = 'user-profile';
            result.parentNode.insertBefore(profileContainer, result);
        }
        const authorName = escapeHTML(data.author?.nickname || 'Unknown');
        const authorAvatar = data.author?.avatar || '/api/placeholder/80/80';
        const videoTitle = escapeHTML(data.title || '');
        profileContainer.innerHTML = `
        <div class="profile-container">
            <div class="profile-info">
                <img src="${authorAvatar}" alt="${authorName}" class="profile-avatar">
                <div>
                    <h3 class="profile-name">${authorName}</h3>
                    <p class="profile-description">${videoTitle}</p>
                </div>
            </div>
        </div>
        `;
        profileContainer.style.display = 'block';
    }
    // Gọi API backend
    async function downloadTikTokVideo(url) {
        try {
            const response = await fetch(`https://toksave-server.onrender.com/api/tiktok?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API response:', errorText);
                throw new Error(`API trả về lỗi: ${response.status}`);
            }
            return await response.json();
        } catch (err) {
            console.error('Lỗi khi gọi API:', err);
            return {error: true, message: `Lỗi server: ${err.message}`};
        }
    }
    // Tải file
    function downloadVideo(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank'; // Mở trong tab mới để tránh các vấn đề CORS
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const header = document.querySelector('header');
    // Auto set chiều cao header vào CSS biến
    const headerHeight = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', headerHeight + 'px');

    mobileMenuIcon.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
    });
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnIcon = mobileMenuIcon.contains(event.target);

        if (!isClickInsideMenu && !isClickOnIcon) {
            mobileMenu.classList.remove('active');
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('video-url');
    const clearButton = document.getElementById('clear-input');
    // Hiển thị/ẩn nút X dựa vào nội dung input
    function updateClearButton() {
        if (inputField.value.length > 0) {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
    }
    // Gọi hàm khi có thay đổi nội dung
    inputField.addEventListener('input', updateClearButton);
    // Xóa input khi nhấn nút X
    clearButton.addEventListener('click', function() {
        inputField.value = '';
        updateClearButton();
        inputField.focus();
    });
    // Khi người dùng nhấp vào ô input
    inputField.addEventListener('click', function() {
        // Chỉ paste khi ô input trống
        if (inputField.value === '') {
            navigator.clipboard.readText()
                .then(text => {
                    if (text) {
                        inputField.value = text;
                        // Quan trọng: Cập nhật trạng thái nút xóa sau khi dán
                        updateClearButton();
                    }
                })
                .catch(err => {
                    console.log('Không thể truy cập clipboard');
                });
        }
    });
    // Kiểm tra trạng thái ban đầu (nếu có giá trị khi trang tải)
    updateClearButton();
});