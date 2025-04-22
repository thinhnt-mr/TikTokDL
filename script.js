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

    let userIP = '';

    // Lấy địa chỉ IP
    async function getUserIP() {
        try {
            const res = await fetch('https://ipinfo.io/json?token=8a9df5f0d0cdba'); // dùng token free nếu bị rate limit
            const data = await res.json();
            return data.ip || '';
        } catch (err) {
            console.error('Không lấy được IP:', err);
            return '';
        }
    }

    // Giới hạn lượt tải theo IP
    function canDownload(ip) {
        if (!ip) return true;

        const today = new Date().toISOString().split('T')[0];
        const data = JSON.parse(localStorage.getItem('downloadByIP')) || {};

        if (!data[ip] || data[ip].date !== today) {
            data[ip] = { date: today, count: 0 };
        }

        if (data[ip].count >= 5) {
            return false;
        }

        data[ip].count += 1;
        localStorage.setItem('downloadByIP', JSON.stringify(data));
        return true;
    }

    // Xử lý tải video
    downloadBtn.addEventListener('click', async function () {
        if (!userIP) {
            userIP = await getUserIP();
        }

        if (!canDownload(userIP)) {
            alert('Thiết bị của bạn đã vượt quá 5 lượt tải miễn phí hôm nay. Vui lòng quay lại vào ngày mai.');
            return;
        }

        const url = videoUrlInput.value.trim();
        if (!url) {
            alert('Vui lòng nhập đường link video TikTok');
            return;
        }

        loading.style.display = 'block';
        errorMessage.style.display = 'none';
        result.style.display = 'none';

        try {
            const videoData = await downloadTikTokVideo(url);
            loading.style.display = 'none';

            if (videoData && videoData.data) {
                videoThumbnail.src = videoData.data.cover || '/api/placeholder/350/500';
                const noWatermarkUrl = videoData.data.play || '';
                const withWatermarkUrl = videoData.data.wmplay || '';
                const audioUrl = videoData.data.music || '';

                if (noWatermarkUrl) {
                    downloadNoWatermark.onclick = e => {
                        e.preventDefault();
                        downloadVideo(noWatermarkUrl, 'tiktok-no-watermark.mp4');
                    };
                    downloadNoWatermark.style.opacity = '1';
                    downloadNoWatermark.style.pointerEvents = 'auto';
                } else {
                    downloadNoWatermark.style.opacity = '0.5';
                    downloadNoWatermark.style.pointerEvents = 'none';
                }

                if (withWatermarkUrl) {
                    downloadWithWatermark.onclick = e => {
                        e.preventDefault();
                        downloadVideo(withWatermarkUrl, 'tiktok-with-watermark.mp4');
                    };
                    downloadWithWatermark.style.opacity = '1';
                    downloadWithWatermark.style.pointerEvents = 'auto';
                } else {
                    downloadWithWatermark.style.opacity = '0.5';
                    downloadWithWatermark.style.pointerEvents = 'none';
                }

                if (audioUrl) {
                    downloadAudio.onclick = e => {
                        e.preventDefault();
                        downloadVideo(audioUrl, 'tiktok-audio.mp3');
                    };
                    downloadAudio.style.opacity = '1';
                    downloadAudio.style.pointerEvents = 'auto';
                } else {
                    downloadAudio.style.opacity = '0.5';
                    downloadAudio.style.pointerEvents = 'none';
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

    async function downloadTikTokVideo(url) {
        const response = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const result = await response.json();
        return result;
    }

    function downloadVideo(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    }

    videoUrlInput.addEventListener('focus', function () {
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
                .then(text => {
                    if (text.includes('tiktok.com') && !videoUrlInput.value) {
                        videoUrlInput.value = text;
                    }
                })
                .catch(err => {
                    console.log('Không thể truy cập clipboard:', err);
                });
        }
    });

    videoUrlInput.addEventListener('paste', function () {
        setTimeout(() => {
            if (videoUrlInput.value.includes('tiktok.com')) {
                downloadBtn.click();
            }
        }, 100);
    });

    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('open');
        });
    });

    // Lấy IP ngay khi load lần đầu
    getUserIP().then(ip => {
        userIP = ip;
    });
});

// Define translations for all text elements
const translations = {
    'vi': {
        'page-title': 'Tải Video TikTok Không Watermark | Miễn Phí & Nhanh Chóng',
        'logo-text': 'TikTokDL',
        'hero-title': 'Tải video TikTok không giới hạn',
        'hero-desc': 'Công cụ tải video TikTok miễn phí, nhanh chóng và an toàn. Tải video TikTok không có watermark với chỉ một vài thao tác đơn giản.',
        'video-url': 'Dán đường link video TikTok vào đây...',
        'download-btn': 'Tải xuống',
        'loading-text': 'Đang phân tích video...',
        'error-message': 'Xin lỗi, không thể xử lý đường link này. Vui lòng kiểm tra và thử lại.',
        'download-no-watermark': 'Tải không watermark',
        'download-with-watermark': 'Tải có watermark',
        'download-audio': 'Tải âm thanh MP3',
        'feature1-title': 'Tải xuống nhanh chóng',
        'feature1-desc': 'Tải video TikTok chỉ trong vài giây với tốc độ cao và không có giới hạn.',
        'feature2-title': 'Chất lượng cao',
        'feature2-desc': 'Tải video với chất lượng HD, giữ nguyên độ phân giải gốc của video.',
        'feature3-title': 'An toàn & Bảo mật',
        'feature3-desc': 'Không cần đăng ký, không lưu trữ video của bạn, bảo mật thông tin người dùng.',
        'how-to-title': 'Cách sử dụng',
        'step1-title': 'Sao chép link',
        'step1-desc': 'Mở ứng dụng TikTok, tìm video bạn muốn tải và nhấn vào nút "Chia sẻ". Sau đó chọn "Sao chép liên kết".',
        'step2-title': 'Dán link',
        'step2-desc': 'Dán liên kết video vào ô nhập liệu trên trang web của chúng tôi.',
        'step3-title': 'Tải xuống',
        'step3-desc': 'Nhấn nút "Tải xuống" và chọn định dạng bạn muốn tải video.',

        'step4-title': 'Lưu video TikTok trên điện thoại di động',
        'step4-desc': '<b>Bước 1:</b> Mở ứng dụng TikTok và tìm video bạn muốn tải về máy.',
        'step5-desc': '<b>Bước 2:</b> Khi đang xem video, bạn sẽ thấy biểu tượng “Chia sẻ” (hình mũi tên hướng sang phải) ở bên phải video. Nhấn vào đó và chọn “Sao chép liên kết”.',
        'step6-desc': '<b>Bước 3:</b> Tiếp theo, truy cập vào trang web hỗ trợ tải video TikTok (TikTokDL).',
        'step7-desc': '<b>Bước 4:</b> Dán liên kết vừa sao chép vào ô nhập link trên trang web và bấm “Tải xuống”.',
        'step8-desc': 'Bạn sẽ thấy video cần tải hiển thị ngay trên màn hình > Chọn vào phương thức Tải rồi ấn vào nút 3 chấm và tải xuống.',
        'step5-title': 'Lưu video TikTok không có logo trên máy tính',

        'step9-desc': '<b>Bước 1:</b> Mở TikTok trên máy tính của bạn lên, bạn có thể sự dụng nền tảng web hay ứng dụng TikTok >\n' + 'Khi đang xem video, bạn sẽ thấy biểu tượng “Chia sẻ” (hình mũi tên hướng sang phải) ở bên phải video. Nhấn vào đó và chọn “Sao chép liên kết”.',
        'step10-desc': '<b>Bước 2:</b> Chọn đến mục Sao chép liên kết để tiến hành lấy link video.',
        'step11-desc': '<b>Bước 3:</b> Vì TikTok chưa hỗ trợ tính tăng tải video không logo nên bạn hãy truy cập công cụ hỗ trợ "TikTokDL" để tải video.',
        'step12-desc': '<b>Bước 4:</b> Dán liên kết mà bạn sao chép ở bước 2 vào ô nhập link > Nhấn Tải Xuống.',
        'step13-desc': 'Chờ một chút Bạn sẽ thấy video cần tải hiển thị ngay trên màn hình > Chọn vào phương thức Tải rồi ấn vào nút 3 chấm và tải xuống.',

        'step6-title': 'Tải Video TikTok không logo trên iPhone',
        'step14-desc': 'Nếu bạn đang dùng iPhone hoặc iPad bạn cũng có thể tải video TikTok miễn phí cho thiết bị Apple, nhưng bạn cần cài thêm ứng dụng Documents by Readdle trên App Store.',
        'step15-desc': 'Vì chính sách bảo mật của Apple, iOS từ phiên bản 12 trở nên sẽ không lưu được video từ TikTok trên trình duyệt.\n' + 'Hãy chép liên kết của một video bất kỳ trên TikTok, sau đó mở ứng dụng Documents by Readdle.',
        'step16-desc': 'Ngay góc dưới bên phải của màn hình, bạn sẽ thấy một biểu tượng trình duyệt web. Hãy chạm vào nó.',
        'faq-title': 'Câu hỏi thường gặp',
        'faq-q1': '1. TikTokDL có hoàn toàn miễn phí không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a1': 'Có, TikTokDL hoàn toàn miễn phí để sử dụng. Không có phí ẩn hoặc giới hạn tải xuống.',
        'faq-q2': '2. Tôi có thể tải video từ TikTok Trung Quốc (Douyin) không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a2': 'Hiện tại TikTokDL chỉ hỗ trợ video từ TikTok phiên bản quốc tế, không hỗ trợ Douyin.',
        'faq-q3': '3. Có thể dùng TikTokDL trên máy tính bảng không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a3': 'Có, TikTokDL tương thích với cả máy tính bảng và các thiết bị di động có trình duyệt web.',
        'faq-q4': '4. Có thể tải video riêng tư không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a4': 'Không, TikTokDL chỉ có thể tải các video công khai trên TikTok. Không thể tải video riêng tư.',
        'faq-q5': '5. Video đã tải về được lưu ở đâu?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a5': 'Sau khi tải xong, video sẽ được lưu trong thư mục "Tải xuống" (Downloads) mặc định trên thiết bị của bạn.',
        'faq-q6': '6. Tôi có thể tải hàng loạt nhiều video cùng lúc không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a6': 'Hiện tại, TikTokDL chỉ hỗ trợ tải từng video một. Tính năng tải hàng loạt sẽ được xem xét trong tương lai.',
        'faq-q7': '7. Tôi có thể tải video TikTok trên điện thoại di động không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a7': 'Có, TikTokDL hoạt động trên tất cả các thiết bị, bao gồm điện thoại di động, máy tính bảng và máy tính để bàn.',
        'faq-q8': '8. TikTokDL có hoạt động trên iPhone/iOS không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a8': 'Có, bạn có thể sử dụng TikTokDL trên trình duyệt Safari hoặc Chrome trên iPhone mà không cần cài thêm ứng dụng.',
        'faq-q9': '9. Có thể tải video TikTok ở chế độ HD không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a9': 'Tùy vào chất lượng gốc của video trên TikTok, TikTokDL sẽ cố gắng giữ nguyên độ phân giải cao nhất có thể (bao gồm HD nếu có).',
        'faq-q10': '10. Website có chứa quảng cáo không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a10': 'Một số quảng cáo có thể được hiển thị để duy trì hoạt động của website, nhưng sẽ không ảnh hưởng đến trải nghiệm tải video của bạn.',
        'faq-q11': '11. Tôi có thể chia sẻ video đã tải không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a11': 'Bạn có thể chia sẻ video đã tải cho mục đích cá nhân. Tuy nhiên, không nên chia sẻ công khai nếu video thuộc sở hữu của người khác và chưa được cho phép.',
        'faq-q12': '12. Tải video không có watermark có hợp pháp không?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a12': 'Có, tải video TikTok để sử dụng cá nhân là hợp pháp. Tuy nhiên, hãy tôn trọng quyền sở hữu trí tuệ và không sử dụng video cho mục đích thương mại mà không có sự cho phép từ chủ sở hữu nội dung.',
        'footer-tech': 'Tải video TikTok không có watermark nhanh chóng, đơn giản và hoàn toàn miễn phí.',
        'footer-copyright': '© 2025 TikTokDL. Tất cả các quyền được bảo lưu.',
        'footer-disclaimer': 'Lưu ý: Đây không phải là sản phẩm chính thức của TikTok, vui lòng tải video với mục đích cá nhân.',
    },
    'en': {
        'page-title': 'Download TikTok Videos Without Watermark | Free & Fast',
        'logo-text': 'TikTokDL',
        'hero-title': 'Download unlimited TikTok videos',
        'hero-desc': 'Free, fast and safe TikTok video downloader tool. Download TikTok videos without watermark with just a few simple steps.',
        'video-url': 'Paste TikTok video link here...',
        'download-btn': 'Download',
        'loading-text': 'Analyzing video...',
        'error-message': 'Sorry, we cannot process this link. Please check and try again.',
        'download-no-watermark': 'Download without watermark',
        'download-with-watermark': 'Download with watermark',
        'download-audio': 'Download MP3 audio',
        'feature1-title': 'Fast Download',
        'feature1-desc': 'Download TikTok videos in seconds with high speed and no limits.',
        'feature2-title': 'High Quality',
        'feature2-desc': 'Download videos in HD quality, maintaining the original resolution of the video.',
        'feature3-title': 'Safe & Secure',
        'feature3-desc': 'No registration required, no storage of your videos, user information security.',
        'how-to-title': 'How to Use',
        'step1-title': 'Copy the link',
        'step1-desc': 'Open the TikTok app, find the video you want to download and tap the "Share" button. Then select "Copy link".',
        'step2-title': 'Paste the link',
        'step2-desc': 'Paste the video link into the input field on our website.',
        'step3-title': 'Download',
        'step3-desc': 'Click the "Download" button and select the format you want to download the video in.',
        'step4-title': 'Save TikTok Video on Mobile Device',
        'step4-desc': '<b>Step 1:</b> Open the TikTok app and find the video you want to download.',
        'step5-desc': '<b>Step 2:</b> While watching the video, tap the “Share” icon (a right-pointing arrow) on the right side of the screen. Then select “Copy Link”.',
        'step6-desc': '<b>Step 3:</b> Next, go to a TikTok video downloader website (such as TikTokDL).',
        'step7-desc': '<b>Step 4:</b> Paste the copied link into the input field on the website and tap “Download”.',
        'step8-desc': 'The video will appear on the screen > Choose a download method, tap the three-dot icon, and save the video.',

        'step5-title': 'Download TikTok Video Without Watermark on PC',
        'step9-desc': '<b>Step 1:</b> Open TikTok on your computer — you can use either the web platform or the TikTok desktop app. While watching the video, click the “Share” icon (a right-pointing arrow) and select “Copy Link”.',
        'step10-desc': '<b>Step 2:</b> Choose the “Copy Link” option to get the video URL.',
        'step11-desc': '<b>Step 3:</b> Since TikTok does not support no-watermark downloads natively, open a third-party tool like "TikTokDL" to proceed.',
        'step12-desc': '<b>Step 4:</b> Paste the copied link into the input field > Click Download.',
        'step13-desc': 'Wait a moment — the video will be displayed on the screen > Choose a download option, click the three-dot icon, and save the file.',

        'step6-title': 'Download TikTok Video Without Watermark on iPhone',
        'step14-desc': 'If you’re using an iPhone or iPad, you can also download TikTok videos for free on your Apple device, but you’ll need to install the “Documents by Readdle” app from the App Store.',
        'step15-desc': 'Due to Apple’s security policy, iOS 12 and above will not allow video downloads directly through the browser. Copy the link of any TikTok video, then open the Documents by Readdle app.',
        'step16-desc': 'In the bottom-right corner of the screen, you’ll find a browser icon. Tap on it to open the built-in browser.',

        'faq-title': 'Frequently Asked Questions',
        'faq-q1': '1. Is TikTokDL completely free?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a1': 'Yes, TikTokDL is completely free to use. There are no hidden fees or download limits.',
        'faq-q2': '2. Can I download videos from Chinese TikTok (Douyin)?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a2': 'Currently, TikTokDL only supports videos from the international version of TikTok, not Douyin.',
        'faq-q3': '3. Can I use TikTokDL on a tablet?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a3': 'Yes, TikTokDL is compatible with both tablets and mobile devices with web browsers.',
        'faq-q4': '4. Can I download private videos?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a4': 'No, TikTokDL can only download public videos on TikTok. Private videos cannot be downloaded.',
        'faq-q5': '5. Where are downloaded videos saved?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a5': 'After downloading, the video will be saved in the default "Downloads" folder on your device.',
        'faq-q6': '6. Can I download multiple videos at once?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a6': 'Currently, TikTokDL only supports downloading one video at a time. Batch download feature will be considered in the future.',
        'faq-q7': '7. Can I download TikTok videos on my mobile phone?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a7': 'Yes, TikTokDL works on all devices, including mobile phones, tablets, and desktop computers.',
        'faq-q8': '8. Does TikTokDL work on iPhone/iOS?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a8': 'Yes, you can use TikTokDL on Safari or Chrome browser on iPhone without the need to install additional applications.',
        'faq-q9': '9. Can I download TikTok videos in HD mode?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a9': 'Depending on the original quality of the video on TikTok, TikTokDL will try to maintain the highest possible resolution (including HD if available).',
        'faq-q10': '10. Does the website contain advertisements?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a10': 'Some advertisements may be displayed to maintain the operation of the website, but they will not affect your video downloading experience.',
        'faq-q11': '11. Can I share downloaded videos?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a11': 'You can share downloaded videos for personal purposes. However, you should not share publicly if the video belongs to someone else and has not been permitted.',
        'faq-q12': '12. Is downloading videos without watermark legal?<span class="arrow"><i class="fas fa-chevron-down"></i></span>',
        'faq-a12': 'Yes, downloading TikTok videos for personal use is legal. However, respect intellectual property rights and do not use videos for commercial purposes without permission from the content owner.',
        'footer-tech': 'Quick, simple, and completely free TikTok video downloads without watermark.',
        'footer-copyright': '© 2025 TikTokDL. All rights reserved.',
        'footer-disclaimer': 'Disclaimer: This is not an official TikTok product. Please download videos for personal use only.',
    }
};

// Function to change language
function changeLanguage(lang) {
    // Save the selected language in localStorage
    localStorage.setItem('selectedLanguage', lang);

    // Update button active states
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.language-btn[onclick="changeLanguage('${lang}')"]`).classList.add('active');
    // Update all text elements
    Object.keys(translations[lang]).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Special handling for input placeholder
            if (id === 'video-url') {
                element.placeholder = translations[lang][id];
            }
            // Special handling for document title
            else if (id === 'page-title') {
                document.title = translations[lang][id];
            }
            // For all other elements
            else {
                element.innerHTML = translations[lang][id];
            }
        }
    });
    // Thêm vào hàm changeLanguage để thay đổi màu nền theo ngôn ngữ
    function changeLanguage(lang) {
        // Lưu ngôn ngữ được chọn vào localStorage
        localStorage.setItem('selectedLanguage', lang);

        // Cập nhật trạng thái active của nút
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.language-btn[onclick="changeLanguage('${lang}')"]`).classList.add('active');

        // Thêm/xóa class trên header để thay đổi màu sắc
        const header = document.querySelector('header');
        if (lang === 'vi') {
            header.classList.remove('lang-en');
            header.classList.add('lang-vi');
        } else {
            header.classList.remove('lang-vi');
            header.classList.add('lang-en');
        }
    }
}
// Set up FAQ accordion functionality
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        // Toggle the active class on the question
        this.classList.toggle('active');

        // Toggle the display of the answer
        const answer = this.nextElementSibling;
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
        } else {
            answer.style.display = 'block';
        }

        // Toggle the arrow icon
        const arrow = this.querySelector('.arrow i');
        arrow.classList.toggle('fa-chevron-down');
        arrow.classList.toggle('fa-chevron-up');
    });
});
// Initialize language based on saved preference or default to Vietnamese
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'vi';
    changeLanguage(savedLanguage);
});

// Thêm vào đoạn chạy khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'vi';
    changeLanguage(savedLanguage);
});

document.addEventListener('DOMContentLoaded', function() {
    // Get the mobile menu icon and mobile menu elements
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');

    // Add click event listener to the mobile menu icon
    mobileMenuIcon.addEventListener('click', function() {
        // Toggle the active class on the mobile menu
        mobileMenu.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');

    // Nếu click ra ngoài menu -> đóng menu
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnIcon = mobileMenuIcon.contains(event.target);

        if (!isClickInsideMenu && !isClickOnIcon) {
            mobileMenu.classList.remove('active');
        }
    });
});


