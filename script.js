// ===================================
// JavaScript Functionality
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initMobileMenu();
    initAudioPlayers();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
    initDemoFilters();
    initScriptToggles();
    initMusicToggle();
    checkFormSuccess();
});

// ===================================
// Check for Form Submission Success (redirect fallback)
// ===================================
function checkFormSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const isArabic = document.documentElement.lang === 'ar';
        
        // Show success message
        setTimeout(() => {
            showNotification(
                isArabic 
                    ? 'شكراً لك! تم إرسال رسالتك بنجاح. سأتواصل معك قريباً.' 
                    : 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.',
                'success'
            );
        }, 500);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Scroll to contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ===================================
// Navbar Scroll Effect
// ===================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
    });
    
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// ===================================
// Mobile Menu Toggle
// ===================================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });
    }
}

// ===================================
// Audio Players
// ===================================
let audioPlayerInstances = []; // Store all audio player data globally
let currentAudioMode = 'music'; // 'clear' or 'music' - default is music

function initAudioPlayers() {
    const audioPlayers = document.querySelectorAll('.audio-player');
    let currentAudio = null;
    let currentPlayBtn = null;
    
    audioPlayers.forEach((player, index) => {
        const playBtn = player.querySelector('.play-btn');
        const progressContainer = player.querySelector('.progress-container');
        const progressBar = player.querySelector('.progress-bar');
        const durationDisplay = player.querySelector('.duration');
        const audioSrcClear = player.getAttribute('data-src');
        const audioSrcMusic = player.getAttribute('data-src-music');
        
        // Create audio element with current mode (default is music)
        let audio = new Audio(audioSrcMusic || audioSrcClear);
        
        // Store instance for later switching
        audioPlayerInstances[index] = {
            player,
            playBtn,
            progressContainer,
            progressBar,
            durationDisplay,
            audioSrcClear,
            audioSrcMusic,
            audio
        };
        
        // Load audio metadata
        audio.addEventListener('loadedmetadata', function() {
            durationDisplay.textContent = formatTime(audio.duration);
        });
        
        // Handle audio loading errors
        audio.addEventListener('error', function(e) {
            console.log('Audio loading error');
            durationDisplay.textContent = '--:--';
        });
        
        // Play/Pause functionality
        playBtn.addEventListener('click', function() {
            const instance = audioPlayerInstances[index];
            const currentAudioEl = instance.audio;
            
            // Stop any other playing audio
            audioPlayerInstances.forEach((inst, i) => {
                if (i !== index && inst.audio && !inst.audio.paused) {
                    inst.audio.pause();
                    inst.audio.currentTime = 0;
                    inst.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    inst.playBtn.classList.remove('playing');
                    inst.progressBar.style.width = '0%';
                }
            });
            
            if (currentAudioEl.paused) {
                currentAudioEl.play().catch(e => console.log('Playback failed:', e));
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                playBtn.classList.add('playing');
            } else {
                currentAudioEl.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                playBtn.classList.remove('playing');
            }
        });
        
        // Update progress bar
        audio.addEventListener('timeupdate', function() {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = progress + '%';
            durationDisplay.textContent = formatTime(audio.currentTime);
        });
        
        // Audio ended
        audio.addEventListener('ended', function() {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.classList.remove('playing');
            progressBar.style.width = '0%';
            durationDisplay.textContent = formatTime(audio.duration);
        });
        
        // Click on progress bar to seek
        progressContainer.addEventListener('click', function(e) {
            const instance = audioPlayerInstances[index];
            const rect = progressContainer.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            instance.audio.currentTime = clickPosition * instance.audio.duration;
        });
    });
}

// Format time helper
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// ===================================
// Music Toggle (Clear Voice / With Music)
// ===================================
function initMusicToggle() {
    const musicBtns = document.querySelectorAll('.music-btn');
    
    musicBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            if (mode === currentAudioMode) return; // Already active
            
            // Update active button
            musicBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update audio mode
            currentAudioMode = mode;
            
            // Switch all audio sources
            audioPlayerInstances.forEach(instance => {
                // Stop current audio if playing
                if (instance.audio && !instance.audio.paused) {
                    instance.audio.pause();
                    instance.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    instance.playBtn.classList.remove('playing');
                }
                
                // Get new source
                const newSrc = mode === 'music' ? instance.audioSrcMusic : instance.audioSrcClear;
                
                // Create new audio with new source
                const newAudio = new Audio(newSrc);
                
                // Copy event listeners
                newAudio.addEventListener('loadedmetadata', function() {
                    instance.durationDisplay.textContent = formatTime(newAudio.duration);
                });
                
                newAudio.addEventListener('timeupdate', function() {
                    const progress = (newAudio.currentTime / newAudio.duration) * 100;
                    instance.progressBar.style.width = progress + '%';
                    instance.durationDisplay.textContent = formatTime(newAudio.currentTime);
                });
                
                newAudio.addEventListener('ended', function() {
                    instance.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    instance.playBtn.classList.remove('playing');
                    instance.progressBar.style.width = '0%';
                    instance.durationDisplay.textContent = formatTime(newAudio.duration);
                });
                
                newAudio.addEventListener('error', function() {
                    instance.durationDisplay.textContent = '--:--';
                });
                
                // Reset progress bar
                instance.progressBar.style.width = '0%';
                instance.durationDisplay.textContent = '0:00';
                
                // Update instance
                instance.audio = newAudio;
            });
        });
    });
}

// ===================================
// Demo Filters
// ===================================
function initDemoFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const demoCards = document.querySelectorAll('.demo-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            demoCards.forEach(card => {
                const lang = card.getAttribute('data-lang');
                
                if (filter === 'all') {
                    card.classList.remove('hidden');
                    card.style.display = '';
                } else if (lang === filter) {
                    card.classList.remove('hidden');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===================================
// Script Toggles
// ===================================
function initScriptToggles() {
    const toggleBtns = document.querySelectorAll('.script-toggle');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const scriptContent = this.nextElementSibling;
            scriptContent.classList.toggle('show');
            
            // Update button text
            if (scriptContent.classList.contains('show')) {
                this.innerHTML = '<i class="fas fa-times"></i> Hide Script';
            } else {
                // Check for Arabic
                const isArabic = document.documentElement.lang === 'ar';
                this.innerHTML = isArabic 
                    ? '<i class="fas fa-file-alt"></i> عرض النص'
                    : '<i class="fas fa-file-alt"></i> View Script';
            }
        });
    });
}

// ===================================
// Smooth Scroll
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// Scroll Animations
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add animation classes to elements
    const animateElements = document.querySelectorAll(
        '.demo-card, .service-card, .skill-item, .studio-feature, ' +
        '.about-content, .about-image, .contact-info, .contact-form-container, ' +
        '.section-header, .studio-content, .studio-visual'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.transitionDelay = (index % 6) * 0.1 + 's';
        observer.observe(el);
    });
    
    // Add CSS class for animated elements
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// Contact Form - Formspree Integration
// ===================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const isArabic = document.documentElement.lang === 'ar';
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (!data.name || !data.email || !data.message) {
                showNotification(
                    isArabic ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.',
                    'error'
                );
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification(
                    isArabic ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.',
                    'error'
                );
                return;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = isArabic 
                ? '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...'
                : '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                // Submit to Formspree via AJAX
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (response.ok && result.ok) {
                    // Success!
                    showNotification(
                        isArabic 
                            ? 'شكراً لك! تم إرسال رسالتك بنجاح. سأتواصل معك قريباً.' 
                            : 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.',
                        'success'
                    );
                    form.reset();
                    // Reset select to default
                    const select = form.querySelector('select');
                    if (select) select.selectedIndex = 0;
                } else if (result.errors) {
                    // Formspree validation errors
                    const errorMsg = result.errors.map(err => err.message).join(', ');
                    throw new Error(errorMsg);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Check if it's a network/CORS error (likely testing locally)
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    // Fallback: submit form normally (will redirect)
                    form.submit();
                    return;
                }
                
                showNotification(
                    isArabic 
                        ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل عبر البريد الإلكتروني مباشرة.'
                        : 'Sorry, something went wrong. Please try again or contact via email directly.',
                    'error'
                );
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    const styles = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        }
        .notification-success { border-left: 4px solid #10b981; }
        .notification-success i:first-child { color: #10b981; }
        .notification-error { border-left: 4px solid #ef4444; }
        .notification-error i:first-child { color: #ef4444; }
        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #9ca3af;
            padding: 5px;
            margin-left: auto;
        }
        .notification-close:hover { color: #4b5563; }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    
    // Add styles to head if not already added
    if (!document.querySelector('#notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===================================
// Parallax Effect
// ===================================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});
