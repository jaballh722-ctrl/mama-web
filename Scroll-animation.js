// =====================================================
// كود تأثيرات الظهور عند السكرول فقط
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    
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
    }
    
    // وظيفة للتحقق من ظهور العنصر في الشاشة
    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
        
        return (vertInView && horInView);
    }
    
    // تفعيل التأثير عند السكرول
    function handleScrollReveal() {
        const scrollElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
        
        scrollElements.forEach(el => {
            if (isInViewport(el)) {
                el.classList.add('active');
            }
        });
    }
    
    // استدعاء الوظائف
    addScrollClasses();
    
    // تفعيل التأثير عند تحميل الصفحة
    setTimeout(handleScrollReveal, 100);
    
    // تفعيل التأثير عند السكرول
    window.addEventListener('scroll', handleScrollReveal);
    
    // تفعيل التأثير عند تغيير حجم الشاشة
    window.addEventListener('resize', handleScrollReveal);
});
