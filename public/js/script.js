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

        const existingProfile = document.getElementById('user-profile');
        if (existingProfile) {
            existingProfile.style.display = 'none';
        }

        try {
            const videoData = await downloadTikTokVideo(url);
            loading.style.display = 'none';
            if (videoData && videoData.data) {
                displayUserProfile(videoData.data);

                videoThumbnail.src = videoData.data.cover || '/api/placeholder/350/500';
                videoThumbnail.alt = 'Video Thumbnail';

                // Setup download buttons
                setupDownloadButton(downloadNoWatermark, videoData.data.play, 'tiktok-no-watermark.mp4');
                setupDownloadButton(downloadWithWatermark, videoData.data.wmplay, 'tiktok-with-watermark.mp4');
                setupDownloadButton(downloadAudio, videoData.data.music, 'tiktok-audio.mp3');

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
    // Thiết lập button tải hoặc xem ảnh
    function setupDownloadButton(button, url, filename) {
        if (!button) return;
        if (url) {
            const isImage = /\.(jpg|jpeg|png)$/i.test(filename);
            button.onclick = e => {
                e.preventDefault();
                if (isImage) {
                    window.open(url, '_blank'); // Mở ảnh ở tab mới để xem trước
                } else {
                    // Gọi endpoint proxy tải file để ép tải về
                    const proxyUrl = `https://toksave-server.onrender.com/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
                    const a = document.createElement('a');
                    a.href = proxyUrl;
                    a.download = filename;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => document.body.removeChild(a), 100);
                }
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
        const proxyUrl = `https://toksave-server.onrender.com/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
        const a = document.createElement('a');
        a.href = proxyUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const hamburgerSpin = document.querySelector('.hamburger-spin');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuLinks = document.querySelectorAll('.mobile-menu a'); // Select all links inside mobile menu

    // Function to close menu and reset icon
    function closeMenu() {
        mobileMenu.classList.remove('active');
        hamburgerSpin.classList.remove('active');
    }

    // Toggle menu and icon animation
    mobileMenuIcon.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        hamburgerSpin.classList.toggle('active');
    });

    // Add click event listeners to all menu links
    menuLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMenu(); // Close menu when any link is clicked
        });
    });

    // Close menu and reset icon when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnIcon = mobileMenuIcon.contains(event.target);

        if (!isClickInsideMenu && !isClickOnIcon) {
            closeMenu();
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
// Tạo ID người dùng ngẫu nhiên
function generateRandomUserId() {
    return "Người dùng " + Math.floor(Math.random() * 900000 + 100000);
}

// Số lượng bình luận hiển thị ban đầu
const initialCommentsToShow = 5;

// Khởi tạo mảng bình luận từ localStorage hoặc mảng trống nếu chưa có
let comments = JSON.parse(localStorage.getItem('comments')) || [];

// Lấy các phần tử DOM
const commentInput = document.getElementById('comment-input');
const submitButton = document.getElementById('submit-comment');
const commentsContainer = document.getElementById('comments-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const messageContainer = document.getElementById('message-container');
const ratingInputs = document.querySelectorAll('input[name="rating"]');

// Hiển thị bình luận
function displayComments() {
    commentsContainer.innerHTML = '';

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<div class="no-comments">Chưa có bình luận nào.</div>';
        loadMoreBtn.classList.add('hidden');
        return;
    }

    // Sắp xếp bình luận theo thời gian mới nhất
    const sortedComments = [...comments].sort((a, b) => b.timestamp - a.timestamp);

    // Số lượng bình luận hiển thị
    const commentsToShow = sortedComments.length > initialCommentsToShow
        ? initialCommentsToShow
        : sortedComments.length;

    // Hiển thị các bình luận đầu tiên
    for (let i = 0; i < commentsToShow; i++) {
        addCommentToDOM(sortedComments[i], false);
    }

    // Hiển thị các bình luận còn lại (nếu có) nhưng ẩn đi
    for (let i = initialCommentsToShow; i < sortedComments.length; i++) {
        addCommentToDOM(sortedComments[i], true);
    }

    // Hiển thị hoặc ẩn nút "Xem thêm"
    if (sortedComments.length > initialCommentsToShow) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }
}

// Tạo HTML hiển thị sao đánh giá
function generateStarRating(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<span class="star">★</span>';
        } else {
            starsHTML += '<span class="empty-star">★</span>';
        }
    }
    return starsHTML;
}

// Thêm bình luận vào DOM
function addCommentToDOM(comment, hidden) {
    const commentElement = document.createElement('div');
    commentElement.className = `comment ${hidden ? 'hidden' : ''}`;

    const date = new Date(comment.timestamp);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

    // Tạo HTML cho rating (nếu có)
    const ratingHTML = comment.rating ?
        `<div class="comment-rating">${generateStarRating(comment.rating)}</div>` : '';

    commentElement.innerHTML = `
                <div class="comment-avatar">
                    <img src="${comment.avatar}" alt="Avatar">
                </div>
                <div class="comment-content">
                    <div class="comment-user">${comment.userName}</div>
                    ${ratingHTML}
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-date">${formattedDate}</div>
                </div>
            `;
    commentsContainer.appendChild(commentElement);
}
// Kiểm tra xem người dùng đã bình luận trong ngày chưa
function hasCommentedToday() {
    const lastCommentDate = localStorage.getItem('lastCommentDate');
    if (!lastCommentDate) return false;

    const today = new Date().toDateString();
    const lastDate = new Date(parseInt(lastCommentDate)).toDateString();

    return today === lastDate;
}
// Hiển thị thông báo
function showMessage(message, type = 'error') {
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;

    // Xóa thông báo sau 3 giây
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}
// Lấy giá trị đánh giá đã chọn
function getSelectedRating() {
    for (const input of ratingInputs) {
        if (input.checked) {
            return parseInt(input.value);
        }
    }
    return 0;
}
// Xử lý sự kiện khi nhấn nút "Gửi bình luận"
submitButton.addEventListener('click', () => {
    const commentText = commentInput.value.trim();
    const rating = getSelectedRating();

    if (commentText === '') {
        showMessage('Vui lòng nhập nội dung bình luận!');
        return;
    }

    if (rating === 0) {
        showMessage('Vui lòng chọn đánh giá sao!');
        return;
    }

    if (hasCommentedToday()) {
        showMessage('Bạn chỉ được bình luận 1 lần trong ngày!');
        return;
    }

    // Chọn avatar ngẫu nhiên từ thư mục img (ví dụ img/avatar1.png - avatar7.png)
    const randomAvatarIndex = Math.floor(Math.random() * 7) + 1; // 1 đến 7
    const avatarPath = `img/avatar${randomAvatarIndex}.png`;

    // Tạo đối tượng bình luận
    const newComment = {
        userName: generateRandomUserId(),
        text: commentText,
        rating: rating,
        timestamp: Date.now(),
        avatar: avatarPath
    };

    // Lưu bình luận vào mảng và localStorage
    comments.push(newComment);
    localStorage.setItem('comments', JSON.stringify(comments));
    localStorage.setItem('lastCommentDate', Date.now());

    // Hiển thị bình luận mới
    displayComments();

    // Xóa nội dung nhập
    commentInput.value = '';
    ratingInputs.forEach(input => input.checked = false);

    checkCommentStatus();
    showMessage('Bình luận của bạn đã được gửi!', 'success');
});
// Xử lý sự kiện khi nhấn nút "Xem thêm"
loadMoreBtn.addEventListener('click', () => {
    const hiddenComments = document.querySelectorAll('.comment.hidden');
    hiddenComments.forEach(comment => {
        comment.classList.remove('hidden');
    });

    // Ẩn nút "Xem thêm" sau khi đã hiển thị tất cả bình luận
    loadMoreBtn.classList.add('hidden');
});
// Kiểm tra và vô hiệu hóa nút gửi bình luận nếu đã bình luận trong ngày
function checkCommentStatus() {
    if (hasCommentedToday()) {
        submitButton.disabled = true;
        commentInput.disabled = true;
        commentInput.placeholder = "Bạn đã bình luận hôm nay, vui lòng quay lại vào ngày mai.";
        showMessage('Bạn chỉ được bình luận 1 lần trong ngày!');
    } else {
        submitButton.disabled = false;
        commentInput.disabled = false;
        commentInput.placeholder = "Nhập bình luận của bạn...";
    }
}
// Hiển thị bình luận khi trang được tải
window.addEventListener('DOMContentLoaded', () => {
    displayComments();
    checkCommentStatus();
});