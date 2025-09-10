// Slider functionality
let slides = document.querySelectorAll('.slide');
let index = 0;


function showSlide(i) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[i].classList.add('active');
}


setInterval(() => {
    index = (index + 1) % slides.length;
    showSlide(index);
}, 3000);


// Reservation form validation
const resForm = document.getElementById('reservation-form');
if (resForm) {
    resForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Reservation submitted successfully!');
    });
}


// Contact form validation
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Message sent successfully!');
    });
}