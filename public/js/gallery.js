document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.gallery').forEach(gallery => {
        const images = Array.from(gallery.querySelectorAll('img'));
        if (images.length === 0) return;

        const delay = parseInt(gallery.dataset.delay, 10) || 5000;
        let currentIndex = 0;
        let interval;

        // Touch handling variables
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        // Lightbox element (shared across all galleries)
        let lightbox = document.querySelector('.gallery-lightbox');
        if (!lightbox) {
            lightbox = document.createElement('dialog');
            lightbox.className = 'gallery-lightbox';
            lightbox.innerHTML = `
                <div class="gallery-lightbox-content">
                    <button class="gallery-lightbox-close" aria-label="Close preview"><i class="fa-solid fa-xmark"></i></button>
                    <img src="" alt="">
                    <div class="gallery-lightbox-caption"></div>
                </div>
            `;
            document.body.appendChild(lightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.closest('.gallery-lightbox-close')) {
                    lightbox.close();
                }
            });
            lightbox.onclose = () => {
                document.body.style.overflow = '';
            };
        }

        // Create slide structure
        const wrapper = document.createElement('div');
        wrapper.className = 'gallery-slides';

        images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'gallery-slide';
            const newImg = img.cloneNode(true);

            newImg.addEventListener('click', () => {
                if (Math.abs(currentX - startX) > 5) return;

                const lightboxImg = lightbox.querySelector('img');
                const lightboxCaption = lightbox.querySelector('.gallery-lightbox-caption');
                lightboxImg.src = newImg.src;
                lightboxImg.alt = newImg.alt;
                lightboxCaption.textContent = newImg.alt || newImg.title || '';

                document.body.style.overflow = 'hidden';
                clearInterval(interval);
                lightbox.showModal();

                lightbox.onclose = () => {
                    document.body.style.overflow = '';
                    resetTimer();
                };
            });

            slide.appendChild(newImg);
            wrapper.appendChild(slide);
            img.remove();
        });
        gallery.appendChild(wrapper);

        // Caption bar
        const caption = document.createElement('div');
        caption.className = 'gallery-caption';
        gallery.appendChild(caption);

        // Pagination dots
        let dots = [];
        if (images.length > 1) {
            const dotsBar = document.createElement('div');
            dotsBar.className = 'gallery-dots';
            dots = images.map((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'gallery-dot';
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => {
                    currentIndex = index;
                    updateGallery();
                    resetTimer();
                });
                dotsBar.appendChild(dot);
                return dot;
            });
            gallery.appendChild(dotsBar);
        }

        const updateGallery = (withTransition = true) => {
            wrapper.style.transition = withTransition ? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
            wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
            const currentImg = wrapper.querySelectorAll('img')[currentIndex];
            caption.textContent = currentImg.alt || currentImg.title || '';
            caption.style.display = caption.textContent ? 'block' : 'none';

            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });

            const nav = gallery.querySelector('.gallery-nav');
            if (nav) {
                nav.querySelector('.prev').style.opacity = currentIndex === 0 ? '0.45' : '1';
                nav.querySelector('.prev').style.cursor = currentIndex === 0 ? 'default' : 'pointer';
                nav.querySelector('.next').style.opacity = currentIndex === images.length - 1 ? '0.45' : '1';
                nav.querySelector('.next').style.cursor = currentIndex === images.length - 1 ? 'default' : 'pointer';
            }
        };

        const next = (loop = false) => {
            if (currentIndex < images.length - 1) {
                currentIndex++;
            } else if (loop) {
                currentIndex = 0;
            }
            updateGallery();
        };

        const prev = (loop = false) => {
            if (currentIndex > 0) {
                currentIndex--;
            } else if (loop) {
                currentIndex = images.length - 1;
            }
            updateGallery();
        };

        // Navigation buttons
        if (images.length > 1) {
            const nav = document.createElement('div');
            nav.className = 'gallery-nav';
            nav.innerHTML = `
                <button type="button" class="prev" aria-label="Previous slide"><i class="fa-solid fa-chevron-left"></i></button>
                <button type="button" class="next" aria-label="Next slide"><i class="fa-solid fa-chevron-right"></i></button>
            `;
            nav.querySelector('.prev').onclick = (e) => { e.preventDefault(); prev(false); resetTimer(); };
            nav.querySelector('.next').onclick = (e) => { e.preventDefault(); next(false); resetTimer(); };
            gallery.appendChild(nav);
        }

        const resetTimer = () => {
            clearInterval(interval);
            interval = setInterval(() => next(true), delay);
        };

        gallery.addEventListener('mouseenter', () => clearInterval(interval));
        gallery.addEventListener('mouseleave', () => {
            if (!lightbox.open) resetTimer();
        });

        // Touch Events
        gallery.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            clearInterval(interval);
            wrapper.style.transition = 'none';
        }, { passive: true });

        gallery.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            let diff = currentX - startX;

            if (currentIndex === 0 && diff > 0) diff /= 3;
            if (currentIndex === images.length - 1 && diff < 0) diff /= 3;

            wrapper.style.transform = `translateX(calc(-${currentIndex * 100}% + ${diff}px))`;
        }, { passive: true });

        gallery.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            const diff = currentX - startX;
            const threshold = gallery.offsetWidth * 0.2;

            if (Math.abs(diff) > threshold) {
                if (diff > 0 && currentIndex > 0) {
                    prev(false);
                } else if (diff < 0 && currentIndex < images.length - 1) {
                    next(false);
                } else {
                    updateGallery();
                }
            } else {
                updateGallery();
            }
            resetTimer();
        });

        updateGallery();
        resetTimer();
    });
});
