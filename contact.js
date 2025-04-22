const translations = {
    vi: {
        'contact-description': 'Nếu bạn có bất kỳ câu hỏi, góp ý hoặc cần hỗ trợ, vui lòng gửi tin nhắn cho chúng tôi qua biểu mẫu bên dưới hoặc email trực tiếp.',
        'submit': 'Gửi yêu cầu',
        'footer-tech': 'Tải video TikTok không có watermark nhanh chóng, đơn giản và hoàn toàn miễn phí.',
        'footer-disclaimer': 'Lưu ý: Đây không phải là sản phẩm chính thức của TikTok, vui lòng tải video với mục đích cá nhân.',
        'footer-copyright': '© 2025 TikTokDL. Tất cả các quyền được bảo lưu.',
    },
    en: {
        'contact-description': 'If you have any questions, feedback or need support, please send us a message using the form below or email us directly.',
        'submit': 'Submit request',
        'footer-tech': 'Download TikTok videos without watermark quickly, easily, and completely free.',
        'footer-disclaimer': 'Note: This is not an official TikTok product. Please download videos for personal use only.',
        'footer-copyright': '© 2025 TikTokDL. All rights reserved.',
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