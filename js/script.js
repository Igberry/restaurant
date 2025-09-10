// js/script.js - interactions for the restaurant page
document.addEventListener('DOMContentLoaded', function () {
    /* NAV TOGGLE */
    const navToggle = document.getElementById('nav-toggle');
    const siteNav = document.getElementById('site-nav');
    if (navToggle && siteNav) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            siteNav.style.display = siteNav.style.display === 'flex' ? '' : 'flex';
        });
    }

    /* SLIDER */
    (function slider() {
        const slider = document.getElementById('home-slider');
        if (!slider) return;
        const slidesWrap = slider.querySelector('.slides');
        const slides = Array.from(slidesWrap.children);
        const prev = slider.querySelector('.prev');
        const next = slider.querySelector('.next');
        const dotsWrap = document.getElementById('slider-dots');
        let index = 0;
        let interval = null;

        function update() {
            slidesWrap.style.transform = `translateX(-${index * 100}%)`;
            // dots
            if (dotsWrap) {
                Array.from(dotsWrap.children).forEach((b, i) => b.classList.toggle('active', i === index));
            }
        }

        function go(i) {
            index = (i + slides.length) % slides.length;
            update();
        }

        function start() {
            stop();
            interval = setInterval(() => go(index + 1), 4500);
        }

        function stop() {
            if (interval) clearInterval(interval);
        }

        // build dots
        if (dotsWrap) {
            dotsWrap.innerHTML = '';
            slides.forEach((_, i) => {
                const btn = document.createElement('button');
                btn.className = i === 0 ? 'active' : '';
                btn.addEventListener('click', () => {
                    go(i);
                    start();
                });
                dotsWrap.appendChild(btn);
            });
        }

        prev && prev.addEventListener('click', () => { go(index - 1); start(); });
        next && next.addEventListener('click', () => { go(index + 1); start(); });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);

        update();
        start();
    })();

    /* MENU FILTER + LIGHTBOX */
    (function menu() {
        const filters = document.querySelectorAll('.filter-btn');
        const items = document.querySelectorAll('.menu-item');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.getAttribute('data-filter');
                items.forEach(it => {
                    if (cat === 'all' || it.dataset.category === cat) it.style.display = '';
                    else it.style.display = 'none';
                });
            });
        });

        // Lightbox
        const lightbox = document.getElementById('lightbox');
        const lbImage = document.getElementById('lb-image');
        const lbCaption = document.getElementById('lb-caption');
        const lbClose = document.getElementById('lb-close');

        function openLightbox(imgSrc, caption) {
            if (!lightbox) return;
            lbImage.src = imgSrc;
            lbCaption.textContent = caption || '';
            lightbox.classList.add('visible');
            lightbox.setAttribute('aria-hidden', 'false');
        }

        function closeLightbox() {
            if (!lightbox) return;
            lightbox.classList.remove('visible');
            lightbox.setAttribute('aria-hidden', 'true');
            lbImage.src = '';
        }

        document.querySelectorAll('.menu-item img, .more-btn').forEach(el => {
            el.addEventListener('click', (ev) => {
                const item = ev.target.closest('.menu-item');
                if (!item) return;
                const img = item.querySelector('img');
                const title = item.querySelector('h3')?.textContent || '';
                const desc = item.querySelector('.desc')?.textContent || '';
                openLightbox(img.src, `${title} — ${desc}`);
            });
        });

        lbClose && lbClose.addEventListener('click', closeLightbox);
        lightbox && lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    })();

    /* RESERVATION: min date, validation, save draft, local storage */
    (function reservation() {
        const form = document.getElementById('reservation-form');
        if (!form) return;

        const dateInput = document.getElementById('date');
        const timeInput = document.getElementById('time');
        const feedback = document.getElementById('res-feedback');
        const saveDraftBtn = document.getElementById('save-draft');
        const savedList = document.getElementById('saved-list');

        // set minimum date = today
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        if (dateInput) dateInput.min = `${y}-${m}-${d}`;

        // business hours
        const openHour = 10; // 10:00
        const closeHour = 22; // 22:00 (closing hour, not inclusive)

        function loadSaved() {
            const existing = JSON.parse(localStorage.getItem('reservations') || '[]');
            if (!savedList) return;
            if (existing.length === 0) {
                savedList.innerHTML = '<li>No saved reservations.</li>';
                return;
            }
            savedList.innerHTML = existing.map(r =>
                `<li><strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.date)} ${escapeHtml(r.time)} (${escapeHtml(String(r.people))} pax)</li>`
            ).join('');
        }

        function escapeHtml(s) {
            return String(s).replace(/[&<>"']/g, function (m) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
            });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            feedback.textContent = '';

            const name = document.getElementById('name')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            const date = dateInput?.value;
            const time = timeInput?.value;
            const people = document.getElementById('people')?.value;
            const requests = document.getElementById('requests')?.value || '';

            if (!name || !email || !phone || !date || !time) {
                feedback.textContent = 'Please complete all required fields.';
                return;
            }

            const selected = new Date(`${date}T${time}`);
            if (isNaN(selected.getTime())) {
                feedback.textContent = 'Invalid date/time selected.';
                return;
            }
            if (selected < new Date()) {
                feedback.textContent = 'Please choose a future date and time.';
                return;
            }

            const hour = selected.getHours();
            if (hour < openHour || hour >= closeHour) {
                feedback.textContent = `We are open between ${openHour}:00 and ${closeHour}:00.`;
                return;
            }

            // save to localStorage as demonstration (simulate server save)
            try {
                const existing = JSON.parse(localStorage.getItem('reservations') || '[]');
                existing.push({ id: Date.now(), name, email, phone, date, time, people, requests });
                localStorage.setItem('reservations', JSON.stringify(existing));
                feedback.textContent = 'Reservation requested — we will confirm via email shortly.';
                form.reset();
                loadSaved();
            } catch (err) {
                feedback.textContent = 'Could not save reservation locally.';
            }
        });

        // Save draft
        saveDraftBtn && saveDraftBtn.addEventListener('click', function () {
            const draft = {
                name: document.getElementById('name')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                date: dateInput?.value || '',
                time: timeInput?.value || '',
                people: document.getElementById('people')?.value || '',
                requests: document.getElementById('requests')?.value || ''
            };
            localStorage.setItem('reservation-draft', JSON.stringify(draft));
            feedback.textContent = 'Draft saved locally.';
            loadSaved();
        });

        loadSaved();
    })();

    /* CONTACT FORM */
    (function contact() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        const feedback = document.getElementById('contact-feedback');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('cname')?.value.trim();
            const email = document.getElementById('cemail')?.value.trim();
            const message = document.getElementById('cmessage')?.value.trim();

            if (!name || !email || !message) {
                feedback.textContent = 'Please fill in all fields.';
                return;
            }
            feedback.textContent = 'Thanks — your message was sent (simulated).';
            form.reset();
        });
    })();

    /* SIMPLE: highlight nav links on scroll */
    (function navHighlight() {
        const links = document.querySelectorAll('.nav-link');
        const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href')));
        function onScroll() {
            const y = window.scrollY + 120;
            sections.forEach((sec, i) => {
                if (!sec) return;
                if (sec.offsetTop <= y && sec.offsetTop + sec.offsetHeight > y) {
                    links.forEach(l => l.classList.remove('active'));
                    links[i].classList.add('active');
                }
            });
        }
        window.addEventListener('scroll', onScroll);
        onScroll();
    })();

});
