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

document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Lấy token CAPTCHA
    const captchaToken = grecaptcha.getResponse();
    if (!captchaToken) {
        alert("Vui lòng xác nhận CAPTCHA!");
        return;
    }

    // Thu thập dữ liệu form
    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        content: document.getElementById("content").value,
        "g-recaptcha-response": captchaToken
    };

    // Gửi dữ liệu đến Express backend
    try {
        const response = await fetch("/submit-form", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            alert("Gửi thành công!");
            document.getElementById("userForm").reset();
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error("Lỗi khi gửi form:", error);
        alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
        grecaptcha.reset(); // Reset CAPTCHA
    }
});