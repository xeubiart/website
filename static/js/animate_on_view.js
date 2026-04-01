const animatableElements = document.querySelectorAll('.animate_on_view');
const threshold = window.innerWidth >= 670 ? .2 : .4

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(
        entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in_view');
                observer.unobserve(entry.target);
            }
        }
    );
}, {threshold: threshold});

animatableElements.forEach(el => observer.observe(el));