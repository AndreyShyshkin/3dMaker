document.addEventListener('DOMContentLoaded', function () {
    initFloatingBrandItems();
    initServicesDropdown();
    initFlipCards();
    initFeedbackTooltip();
    initResponsiveNav();
});

function initFloatingBrandItems() {
    const brandBlock = document.getElementById('hero');
    const canvas = document.getElementById('brand-floating-canvas');
    if (!brandBlock || !canvas) return;

    const itemImages = [
        'assets/images/spool.svg',
        'assets/images/nozzle.svg',
        'assets/images/caliper.svg',
        'assets/images/model-gear.svg'
    ];

    function calculateItemSize() {
        const titleEl = document.getElementById('hero-brand-title') || brandBlock.querySelector('h1');
        let capHeight = 28;
        if (titleEl) {
            const computed = window.getComputedStyle(titleEl);
            const fs = parseFloat(computed.fontSize);
            if (!isNaN(fs) && fs > 0) {
                capHeight = fs;
            }
        }
        const doubleCap = capHeight * 2;
        return Math.max(76, Math.ceil(doubleCap + 12));
    }

    function spawnFloatingItem() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (width < 120 || height < 120) return;

        const size = calculateItemSize();
        const maxLeft = Math.max(0, width - size - 20);
        const maxTop = Math.max(0, height - size - 20);

        const leftPos = Math.floor(Math.random() * maxLeft) + 10;
        const topPos = Math.floor(Math.random() * maxTop) + 10;
        const randomRotation = (Math.random() * 40 - 20).toFixed(1);
        const randomImage = itemImages[Math.floor(Math.random() * itemImages.length)];

        const item = document.createElement('img');
        item.src = randomImage;
        item.alt = '';
        item.className = 'floating-brand-item';
        item.style.width = size + 'px';
        item.style.height = size + 'px';
        item.style.left = leftPos + 'px';
        item.style.top = topPos + 'px';
        item.style.setProperty('--rot', randomRotation + 'deg');

        canvas.appendChild(item);

        requestAnimationFrame(function () {
            item.classList.add('is-visible');
        });

        setTimeout(function () {
            item.classList.remove('is-visible');
            setTimeout(function () {
                if (item.parentNode === canvas) {
                    canvas.removeChild(item);
                }
            }, 650);
        }, 1900);
    }

    spawnFloatingItem();
    setInterval(spawnFloatingItem, 2100);
}

function initServicesDropdown() {
    const toggle = document.getElementById('services-menu-toggle');
    const submenu = document.getElementById('services-submenu');
    const menuItem = document.getElementById('services-menu-item');

    if (!toggle || !submenu) return;

    toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = submenu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (menuItem) {
            menuItem.classList.toggle('dropdown-open', isOpen);
        }
    });

    document.addEventListener('click', function (e) {
        if (!submenu.contains(e.target) && e.target !== toggle) {
            submenu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            if (menuItem) {
                menuItem.classList.remove('dropdown-open');
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && submenu.classList.contains('is-open')) {
            submenu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            if (menuItem) {
                menuItem.classList.remove('dropdown-open');
            }
            toggle.focus();
        }
    });

    const subLinks = submenu.querySelectorAll('a');
    subLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            submenu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            if (menuItem) {
                menuItem.classList.remove('dropdown-open');
            }
        });
    });
}

function initFlipCards() {
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(function (card) {
        card.addEventListener('mouseenter', function () {
            card.classList.add('is-flipped');
        });

        card.addEventListener('mouseleave', function () {
            card.classList.remove('is-flipped');
        });

        card.addEventListener('focus', function () {
            card.classList.add('is-flipped');
        });

        card.addEventListener('blur', function () {
            card.classList.remove('is-flipped');
        });

        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('is-flipped');
            }
        });
    });
}

function initFeedbackTooltip() {
    const detailsField = document.getElementById('details');
    const tooltip = document.getElementById('details-tooltip');

    if (!detailsField || !tooltip) return;

    function showTooltip() {
        detailsField.classList.add('details-hover-active');
        tooltip.classList.add('is-visible');
        tooltip.setAttribute('aria-hidden', 'false');
    }

    function hideTooltip() {
        if (document.activeElement !== detailsField) {
            detailsField.classList.remove('details-hover-active');
            tooltip.classList.remove('is-visible');
            tooltip.setAttribute('aria-hidden', 'true');
        }
    }

    detailsField.addEventListener('mouseenter', showTooltip);
    detailsField.addEventListener('mouseleave', hideTooltip);
    detailsField.addEventListener('focus', showTooltip);
    detailsField.addEventListener('blur', function () {
        detailsField.classList.remove('details-hover-active');
        tooltip.classList.remove('is-visible');
        tooltip.setAttribute('aria-hidden', 'true');
    });
}

function initResponsiveNav() {
    const nav = document.getElementById('site-main-nav');
    if (!nav) return;

    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const closeBtn = document.getElementById('mobile-nav-close');
    const backdrop = document.getElementById('mobile-nav-backdrop');

    function openMobileNav() {
        nav.classList.add('is-open');
        if (backdrop) {
            backdrop.classList.add('is-active');
            backdrop.setAttribute('aria-hidden', 'false');
        }
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
    }

    function closeMobileNav() {
        nav.classList.remove('is-open');
        if (backdrop) {
            backdrop.classList.remove('is-active');
            backdrop.setAttribute('aria-hidden', 'true');
        }
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function toggleMobileNav() {
        if (nav.classList.contains('is-open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleMobileNav);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileNav);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeMobileNav);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            closeMobileNav();
        }
    });

    const navInteractive = nav.querySelectorAll('.nav-link, .nav-footer-btn');
    navInteractive.forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                closeMobileNav();
            }
        });
    });

    function updateNavOrientation() {
        if (window.innerWidth <= 768) {
            if (!nav.classList.contains('nav-vertical-right')) {
                nav.classList.remove('nav-horizontal-top');
                nav.classList.add('nav-vertical-right');
            }
        } else {
            if (!nav.classList.contains('nav-horizontal-top')) {
                nav.classList.remove('nav-vertical-right');
                nav.classList.add('nav-horizontal-top');
            }
            closeMobileNav();
        }
    }

    window.addEventListener('resize', updateNavOrientation);
    window.addEventListener('orientationchange', updateNavOrientation);
    updateNavOrientation();
}
