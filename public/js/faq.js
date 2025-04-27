document.addEventListener('DOMContentLoaded', function() {
    // Lấy tất cả các phần tử câu hỏi
    const faqQuestions = document.querySelectorAll('.faq-question');
    // Thêm sự kiện click cho mỗi câu hỏi
    faqQuestions.forEach(question => {
        // Lấy phần tử câu trả lời tương ứng
        const answer = question.nextElementSibling;
        // Thêm sự kiện click
        question.addEventListener('click', function() {
            // Kiểm tra trạng thái hiện tại
            const isActive = this.classList.contains('active');
            // Đóng tất cả các câu hỏi và câu trả lời đang mở
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
            });
            document.querySelectorAll('.faq-answer').forEach(a => {
                a.classList.remove('active');
            });
            // Nếu câu hỏi chưa active, mở nó lên
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
    // Xử lý click trực tiếp vào mũi tên
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.addEventListener('click', function(e) {
            e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt
            this.parentElement.click(); // Kích hoạt click trên phần tử cha
        });
    });
    // Hiệu ứng ripple khi click (tùy chọn)
    faqQuestions.forEach(question => {
        question.addEventListener('click', createRipple);
    });
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        const ripple = button.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }
        button.appendChild(circle);
    }
    // Thêm style cho hiệu ứng ripple
    const style = document.createElement('style');
    style.textContent = `
    .faq-question {
      position: relative;
      overflow: hidden;
    }
    .ripple {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(style);
});