// translator.js
// Khởi tạo Google Translate
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'vi',
        includedLanguages: 'en,vi',
        autoDisplay: false
    }, 'google_translate_element');
}

// Kiểm tra khi DOM được tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các event listener cho các nút cờ
    const viFlag = document.getElementById('vi-flag');
    const enFlag = document.getElementById('en-flag');

    if (viFlag) {
        viFlag.addEventListener('click', function() {
            switchLanguage('vi');
        });
    }

    if (enFlag) {
        enFlag.addEventListener('click', function() {
            switchLanguage('en');
        });
    }

    // Kiểm tra ngôn ngữ đã lưu
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
        switchLanguage(savedLanguage);
    }
});

// Hàm chuyển đổi ngôn ngữ
function switchLanguage(lang) {
    // Lưu lựa chọn vào localStorage
    localStorage.setItem('selectedLanguage', lang);

    // Cập nhật trạng thái active của các nút
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const langFlag = document.getElementById(lang + '-flag');
    if (langFlag) {
        langFlag.classList.add('active');
    }

    // Cập nhật màu header nếu cần
    const header = document.querySelector('header');
    if (header) {
        if (lang === 'vi') {
            header.classList.remove('lang-en');
            header.classList.add('lang-vi');
        } else {
            header.classList.remove('lang-vi');
            header.classList.add('lang-en');
        }
    }

    // Xử lý dịch thuật
    if (lang === 'vi') {
        // Trở về ngôn ngữ gốc
        if (document.querySelector('.goog-te-banner-frame')) {
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
            window.location.reload();
        }
    } else {
        // Chuyển sang ngôn ngữ khác
        if (!document.getElementById('google-translate-script')) {
            // Nếu chưa có script, thêm vào
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(script);

            // Chờ script tải xong và kích hoạt dịch
            script.onload = function() {
                setTimeout(function() {
                    translateToLanguage(lang);
                }, 1000);
            };
        } else {
            // Nếu script đã có, kích hoạt dịch ngay
            translateToLanguage(lang);
        }
    }
}

// Hàm kích hoạt dịch qua Google Translate
function translateToLanguage(lang) {
    // Tạo cookie cho Google Translate
    document.cookie = 'googtrans=/vi/' + lang;

    // Tải lại iframe của Google Translate
    const iframe = document.querySelector('.goog-te-menu-frame');
    if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const select = doc.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change'));
        }
    } else {
        // Nếu chưa có iframe, đợi và thử lại
        setTimeout(function() {
            const googleCombo = document.querySelector('.goog-te-combo');
            if (googleCombo) {
                googleCombo.value = lang;
                googleCombo.dispatchEvent(new Event('change'));
            }
        }, 1000);
    }
}