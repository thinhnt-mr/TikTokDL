const translations = {
    vi: {
        'contact-description': 'Liên Hệ',
        'user-name': 'Họ và tên:*',
        'label-email': 'Địa chỉ email:*',
        'label-content': 'Nội dung:*',
        'submit': 'Gửi yêu cầu',
        'footer-tech': 'Tải video TikTok không có watermark nhanh chóng, đơn giản và hoàn toàn miễn phí.',
        'footer-disclaimer': 'Lưu ý: Đây không phải là sản phẩm chính thức của TikTok, vui lòng tải video với mục đích cá nhân.',
        'footer-copyright': '© 2025 TokSave. Tất cả các quyền được bảo lưu.',
    },
    en: {
        'contact-description': 'Contact',
        'user-name': 'Full name:*',
        'label-email': 'Email Address:*',
        'label-content': 'Content:*',
        'submit': 'Submit request',
        'footer-tech': 'Download TikTok videos without watermark quickly, easily, and completely free.',
        'footer-disclaimer': 'Note: This is not an official TikTok product. Please download videos for personal use only.',
        'footer-copyright': '© 2025 TokSave. All rights reserved.',
    }
};

function changeLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    for (const key in t) {
        const el = document.getElementById(key);
        if (el) {
            el.innerText = t[key];
        }
    }

    // Update nút ngôn ngữ đang active
    document.querySelectorAll(".language-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.innerText.toLowerCase() === lang) {
            btn.classList.add("active");
        }
    });

    // Lưu vào localStorage để dùng cho lần sau
    localStorage.setItem("lang", lang);
}

window.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("lang") || "vi";
    changeLanguage(savedLang);
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("userForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn trang reload

        const formData = new FormData(form);

        fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSdLkUVNKbNc7BYJHZ9PrN9NeTbXSmfjZ4zD5biOGKjrvTf7Ig/formResponse", {
            method: "POST",
            mode: "no-cors",
            body: formData
        })
            .then(() => {
                alert("✅ Gửi biểu mẫu thành công!");
                form.reset(); // Reset lại các ô input
            })
            .catch((error) => {
                alert("❌ Có lỗi xảy ra khi gửi biểu mẫu. Vui lòng thử lại sau.");
                console.error("Lỗi:", error);
            });
    });
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