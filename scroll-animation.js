// =====================================================
// كود تأثيرات الظهور عند السكرول فقط
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
    // إضافة الكلاسات للعناصر المراد تطبيق التأثير عليها
    function addScrollClasses() {
        // بطاقات الخدمات - تظهر من اليسار واليمين بالتناوب
        const serviceCards = document.querySelectorAll('.cardpage2');
        serviceCards.forEach((card, index) => {
            if (index % 2 === 0) {
                card.classList.add('scroll-reveal-left');
            } else {
                card.classList.add('scroll-reveal-right');
            }
        });

        // بطاقات الباقات - تظهر بتأثير التكبير
        const packageCards = document.querySelectorAll('.card3');
        packageCards.forEach(card => {
            card.classList.add('scroll-reveal-scale');
        });

        // عناصر القائمة - تظهر من اليسار واليمين
        const menuLeft = document.querySelectorAll('.menu-l');
        const menuRight = document.querySelectorAll('.menu-r');

        menuLeft.forEach(item => {
            item.classList.add('scroll-reveal-left');
        });

        menuRight.forEach(item => {
            item.classList.add('scroll-reveal-right');
        });

        // نماذج التواصل - تظهر من الجانبين
        const contactForms = document.querySelectorAll('.contact-form');
        contactForms.forEach((form, index) => {
            if (index === 0) {
                form.classList.add('scroll-reveal-left');
            } else {
                form.classList.add('scroll-reveal-right');
            }
        });

        // عناوين الأقسام والنص التعريفي
        const introElements = document.querySelectorAll('.page1 h1, .page1 p');
        introElements.forEach(el => {
            el.classList.add('scroll-reveal');
        });

        const sectionTitles = document.querySelectorAll('#page2 h1, #page3 > h1, #page4 > h1, #secret > h1');
        sectionTitles.forEach(title => {
            title.classList.add('scroll-reveal');
        });
    }

    // تفعيل التأثير عند السكرول باستخدام Intersection Observer
    function observeScrollReveal() {
        const scrollElements = document.querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
        );

        if (!('IntersectionObserver' in window)) {
            scrollElements.forEach(el => {
                el.classList.add('active');
            });
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    } else {
                        entry.target.classList.remove('active');
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '0px 0px -10% 0px',
            }
        );

        scrollElements.forEach(el => observer.observe(el));
    }

    addScrollClasses();
    observeScrollReveal();
});
