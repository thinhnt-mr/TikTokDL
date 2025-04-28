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

