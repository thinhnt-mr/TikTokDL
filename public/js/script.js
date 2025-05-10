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

                // Setup download buttons với URL proxy server để ẩn URL gốc
                if (videoData.data.play) {
                    setupProxyDownload(downloadNoWatermark, videoData.data.play, 'nowm');
                    downloadNoWatermark.style.opacity = '1';
                    downloadNoWatermark.style.pointerEvents = 'auto';
                } else {
                    downloadNoWatermark.style.opacity = '0.5';
                    downloadNoWatermark.style.pointerEvents = 'none';
                }

                if (videoData.data.wmplay) {
                    setupProxyDownload(downloadWithWatermark, videoData.data.wmplay, 'wm');
                    downloadWithWatermark.style.opacity = '1';
                    downloadWithWatermark.style.pointerEvents = 'auto';
                } else {
                    downloadWithWatermark.style.opacity = '0.5';
                    downloadWithWatermark.style.pointerEvents = 'none';
                }

                if (videoData.data.music) {
                    setupProxyDownload(downloadAudio, videoData.data.music, 'audio');
                    downloadAudio.style.opacity = '1';
                    downloadAudio.style.pointerEvents = 'auto';
                } else {
                    downloadAudio.style.opacity = '0.5';
                    downloadAudio.style.pointerEvents = 'none';
                }

                // Đảm bảo downloadCover được định nghĩa trước khi sử dụng
                if (downloadCover && videoData.data.cover) {
                    setupProxyDownload(downloadCover, videoData.data.cover, 'cover');
                    downloadCover.style.opacity = '1';
                    downloadCover.style.pointerEvents = 'auto';
                } else if (downloadCover) {
                    downloadCover.style.opacity = '0.5';
                    downloadCover.style.pointerEvents = 'none';
                }

                result.style.display = 'block';

                // Xóa URL từ ô input sau khi tải thành công
                videoUrlInput.value = '';
                // Cập nhật nút clear input
                updateClearButton();

                // Thay đổi URL trang web để ẩn URL video gốc
                if (window.history && window.history.pushState) {
                    const newUrl = window.location.pathname;
                    window.history.pushState({}, document.title, newUrl);
                }
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

    // Thiết lập button tải qua proxy server để ẩn URL gốc
    function setupProxyDownload(button, url, type) {
        if (!button) return;

        button.onclick = function(e) {
            e.preventDefault();

            // Tạo URL proxy và thêm tham số URL gốc
            const proxyUrl = `/proxy/video/${type}?url=${encodeURIComponent(url)}`;

            // Sử dụng iframe ẩn để tải xuống mà không hiển thị URL gốc trên thanh địa chỉ
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = proxyUrl;
            document.body.appendChild(iframe);

            // Xóa iframe sau khi đã tải xuống
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 5000);
        };
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

    // Hàm thực hiện việc tải file đã được di chuyển vào setupProxyDownload

    // Xử lý menu mobile
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const header = document.querySelector('header');

    // Auto set chiều cao header vào CSS biến
    if (header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
    }

    if (mobileMenuIcon && mobileMenu) {
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
    }

    // Xử lý clear input button
    const clearButton = document.getElementById('clear-input');

    // Hiển thị/ẩn nút X dựa vào nội dung input
    function updateClearButton() {
        if (clearButton) {
            if (videoUrlInput.value.length > 0) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
        }
    }

    // Gọi hàm khi có thay đổi nội dung
    if (videoUrlInput && clearButton) {
        videoUrlInput.addEventListener('input', updateClearButton);

        // Xóa input khi nhấn nút X
        clearButton.addEventListener('click', function() {
            videoUrlInput.value = '';
            updateClearButton();
            videoUrlInput.focus();
        });

        // Khi người dùng nhấp vào ô input
        videoUrlInput.addEventListener('click', function() {
            // Chỉ paste khi ô input trống
            if (videoUrlInput.value === '') {
                navigator.clipboard.readText()
                    .then(text => {
                        if (text) {
                            videoUrlInput.value = text;
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
    }
});