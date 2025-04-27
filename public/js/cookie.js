// Kiểm tra xem người dùng đã chấp nhận cookie chưa
function checkCookieConsent() {
    return localStorage.getItem('cookieConsent');
}
// Lấy giá trị cookie theo tên
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
// Lưu lựa chọn của người dùng
function saveCookieConsent(consent) {
    localStorage.setItem('cookieConsent', consent);
    document.getElementById('cookie-banner').style.display = 'none';
}
// Thiết lập cookie khi người dùng chấp nhận
function setCookies() {
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    // Cookie cơ bản
    document.cookie = "acceptCookies=true; expires=" + expiryDate + "; path=/";
    // Khởi tạo cookie cho lịch sử video đã tải
    if (!getCookie('downloadHistory')) {
        document.cookie = "downloadHistory=[]; expires=" + expiryDate + "; path=/";
    }
    // Khởi tạo cookie cho định dạng tải xuống ưa thích
    document.cookie = "preferredFormat=mp4; expires=" + expiryDate + "; path=/";
    // Khởi tạo cookie cho chất lượng video mặc định
    document.cookie = "preferredQuality=high; expires=" + expiryDate + "; path=/";
    // Cookie theo dõi sử dụng
    const currentUsage = getCookie('usageCount');
    if (currentUsage) {
        document.cookie = "usageCount=" + (parseInt(currentUsage) + 1) + "; expires=" + expiryDate + "; path=/";
    } else {
        document.cookie = "usageCount=1; expires=" + expiryDate + "; path=/";
    }
    // Cookie ghi nhớ thời gian truy cập cuối
    document.cookie = "lastVisit=" + new Date().toString() + "; expires=" + expiryDate + "; path=/";
}
// Thêm video vào lịch sử tải xuống
function addToDownloadHistory(videoId, videoTitle, downloadDate) {
    if (checkCookieConsent() === 'accepted') {
        const history = getCookie('downloadHistory');
        let downloadHistory = [];
        if (history) {
            try {
                downloadHistory = JSON.parse(history);
            } catch (e) {
                downloadHistory = [];
            }
        }
        // Thêm thông tin video mới vào đầu mảng
        downloadHistory.unshift({
            id: videoId,
            title: videoTitle,
            date: downloadDate || new Date().toString(),
            format: getCookie('preferredFormat') || 'mp4'
        });
        // Giới hạn lịch sử lưu tối đa 20 video
        if (downloadHistory.length > 20) {
            downloadHistory = downloadHistory.slice(0, 20);
        }
        // Lưu lại lịch sử
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = "downloadHistory=" + JSON.stringify(downloadHistory) + "; expires=" + expiryDate + "; path=/";
    }
}
// Cập nhật định dạng tải xuống ưa thích
function updatePreferredFormat(format) {
    if (checkCookieConsent() === 'accepted') {
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = "preferredFormat=" + format + "; expires=" + expiryDate + "; path=/";
    }
}
// Cập nhật chất lượng video ưa thích
function updatePreferredQuality(quality) {
    if (checkCookieConsent() === 'accepted') {
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = "preferredQuality=" + quality + "; expires=" + expiryDate + "; path=/";
    }
}
// Tăng số lần sử dụng
function incrementUsageCount() {
    if (checkCookieConsent() === 'accepted') {
        const currentUsage = getCookie('usageCount');
        const newCount = currentUsage ? (parseInt(currentUsage) + 1) : 1;
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = "usageCount=" + newCount + "; expires=" + expiryDate + "; path=/";
    }
}
// Lấy lịch sử tải xuống
function getDownloadHistory() {
    const history = getCookie('downloadHistory');
    if (history) {
        try {
            return JSON.parse(history);
        } catch (e) {
            return [];
        }
    }
    return [];
}
// Xử lý khi người dùng chấp nhận cookie
document.getElementById('accept-cookies').addEventListener('click', function() {
    setCookies();
    saveCookieConsent('accepted');
});
// Xử lý khi người dùng từ chối cookie
document.getElementById('reject-cookies').addEventListener('click', function() {
    saveCookieConsent('rejected');
});
// Hiển thị thông báo cookie nếu người dùng chưa có lựa chọn
window.onload = function() {
    if (!checkCookieConsent()) {
        setTimeout(function() {
            document.getElementById('cookie-banner').style.display = 'flex';
        }, 1000); // Hiển thị sau 1 giây để không xuất hiện ngay lập tức
    } else if (checkCookieConsent() === 'accepted') {
        // Cập nhật thời gian truy cập cuối và tăng số lần sử dụng
        const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = "lastVisit=" + new Date().toString() + "; expires=" + expiryDate + "; path=/";
        incrementUsageCount();
        // Tải các tùy chọn người dùng từ cookie (nếu có)
        const preferredFormat = getCookie('preferredFormat');
        const preferredQuality = getCookie('preferredQuality');
    }
};
// Hàm ví dụ để hiển thị lịch sử tải xuống
function displayDownloadHistory() {
    const historyContainer = document.getElementById('download-history');
    if (historyContainer) {
        const history = getDownloadHistory();
        if (history.length > 0) {
            let html = '<h3>Lịch sử tải xuống gần đây</h3><ul>';
            history.forEach(item => {
                html += `<li>
                    <strong>${item.title || 'Video TikTok'}</strong> - 
                    Tải xuống vào: ${new Date(item.date).toLocaleString()} - 
                    Định dạng: ${item.format}
                </li>`;
            });
            html += '</ul>';
            historyContainer.innerHTML = html;
            historyContainer.style.display = 'block';
        }
    }
}
// Hàm ví dụ khi người dùng tải một video
function saveDownloadHistory(videoUrl, videoTitle) {
    // Sau khi tải xuống thành công
    incrementUsageCount();
    // Tạo ID ngẫu nhiên cho video (trong thực tế bạn sẽ lấy từ URL TikTok)
    const videoId = 'tiktok_' + Math.random().toString(36).substr(2, 9);
    // Thêm vào lịch sử
    addToDownloadHistory(videoId, videoTitle, new Date().toString());
}