// ============================================
// 🔑 إعدادات Firebase السحابية للآراء
// ============================================
const FIREBASE_DATABASE_URL = "https://mama-website-7a250-default-rtdb.firebaseio.com";

// ============================================
// 🔑 ضع API Key هنا
// ============================================
const ANTHROPIC_API_KEY = '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';

// معلومات الموقع
const WEBSITE_INFO = `أنت مساعد ذكي لموقع "متابعة دراسية" للمرحلة الابتدائية.

الخدمات الأساسية:
- تحديد المهام الدراسية اليومية ومتابعتها
- استخدام مؤقتات زمنية
- تقييم أكاديمي أسبوعي
- جلسات تنمية الانتباه والتركيز
- جلسات التخطيط والتنفيذ

الباقات:
مكتوبة بكود الhtml

للتواصل: واتساب 201116967317

أجب بالعربية بشكل ودود ومختصر مع استخدام الإيموجي.`;

// ============================================
// كود الموقع الأساسي
// ============================================
const SECRET_CODE = "1234"; // كود الدخول كعضو (يفتح قائمة الطعام)
const ADMIN_SECRET_CODE = "5678"; // كود المشرف (يفتح قائمة الطعام + صلاحية إضافة الآراء)
const AUTH_STORAGE_KEY = "mama-auth-state";
let isLoggedIn = false;
let isAdmin = false;
let toastTimeout;
const THEME_STORAGE_KEY = "mama-theme";
let testimonials = [];
let selectedRating = 5;
let editReviewId = null; // متغير لحفظ معرف الرأي المراد تعديله
let isLoginPending = false;

function normalizeDigits(value) {
    return value;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function canManageTestimonials() {
    return isLoggedIn && isAdmin;
}

function applyTheme(themeName) {
    const finalTheme = themeName === "alt" ? "alt" : "default";
    document.body.setAttribute("data-theme", finalTheme);
    localStorage.setItem(THEME_STORAGE_KEY, finalTheme);

    const themeToggleButton = document.getElementById("theme-toggle");
    if (themeToggleButton) {
        const isAlt = finalTheme === "alt";
        const nextThemeLabel = isAlt ? "الأخضر والأبيض" : "الثيم الفاتح";
        themeToggleButton.setAttribute("aria-label", `تغيير الثيم إلى ${nextThemeLabel}`);
        themeToggleButton.setAttribute("title", `تغيير الثيم إلى ${nextThemeLabel}`);
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme") === "alt" ? "alt" : "default";
    const nextTheme = currentTheme === "alt" ? "default" : "alt";
    applyTheme(nextTheme);

    const themeToggleButton = document.getElementById("theme-toggle");
    if (themeToggleButton) {
        themeToggleButton.setAttribute("aria-pressed", nextTheme === "alt" ? "true" : "false");
    }
}

function initThemeToggle() {
    const themeToggleButton = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "default";
    applyTheme(savedTheme);

    if (!themeToggleButton) return;
    themeToggleButton.setAttribute("aria-pressed", savedTheme === "alt" ? "true" : "false");
    themeToggleButton.addEventListener("click", toggleTheme);
}

function showToast(message, bgColor) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = message;
        toast.style.backgroundColor = bgColor || "#333";
        toast.style.visibility = "visible";
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-8px)";
            setTimeout(() => {
                toast.style.visibility = "hidden";
            }, 250);
        }, 3000);
    }
}

function handleForm(form) {
    showToast("سيتم التواصل معك قريبًا!");
    setTimeout(() => form.submit(), 500);
    return false;
}

function openLogin() {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("first-f").style.display = "none";
    document.getElementById("back").style.display = "block";
}

async function login() {
    const codeInput = document.getElementById("code");
    if (!codeInput || isLoginPending) return;
    const code = normalizeDigits(codeInput.value.trim());

    if (!code) {
        showToast("من فضلك أدخل كود الدخول أولًا", "#f44336");
        codeInput.focus();
        return;
    }

    isLoginPending = true;

    if (code === SECRET_CODE) {
        isLoggedIn = true;
        isAdmin = false;
        saveAuthState();
        showToast("✓ تم الدخول كعضو بنجاح", "#4CAF50");
        updateUI();
        document.getElementById("back").style.display = "none";
        isLoginPending = false;
        return;
    }

    if (code === ADMIN_SECRET_CODE) {
        isLoggedIn = true;
        isAdmin = true;
        saveAuthState();
        showToast("✓ تم الدخول كمشرف بنجاح (صلاحيات كاملة)", "#4CAF50");
        updateUI();
        document.getElementById("back").style.display = "none";
        isLoginPending = false;
        return;
    }

    showToast("✗ كود الدخول غير صحيح", "#f44336");
    codeInput.focus();
    codeInput.select();
    isLoginPending = false;
}

function logout() {
    document.getElementById("back").style.display = "none";
    isLoggedIn = false;
    isAdmin = false;
    saveAuthState();
    showToast("تم تسجيل الخروج بنجاح", "#FF9800");
    updateUI();
}

function saveAuthState() {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isLoggedIn, isAdmin }));
}

function loadAuthState() {
    try {
        const rawData = localStorage.getItem(AUTH_STORAGE_KEY);
        const parsedData = rawData ? JSON.parse(rawData) : {};
        isLoggedIn = Boolean(parsedData.isLoggedIn);
        isAdmin = Boolean(parsedData.isAdmin);
    } catch {
        isLoggedIn = false;
        isAdmin = false;
    }
}

function updateUI() {
    const menuLink = document.getElementById("menu-link");
    const addTestimonialButton = document.getElementById("add-testimonial-btn");
    
    if (isLoggedIn) {
        document.getElementById("first-f").style.display = "none";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "block";
        
        if (menuLink) menuLink.style.display = "block";
        const secretDiv = document.getElementById("secret");
        if (secretDiv) secretDiv.style.display = "block";
    } else {
        document.getElementById("secret").style.display = "none";
        document.getElementById("first-f").style.display = "block";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "none";
        if (menuLink) menuLink.style.display = "none";
    }

    if (addTestimonialButton) {
        addTestimonialButton.style.display = canManageTestimonials() ? "inline-flex" : "none";
    }

    renderTestimonials();
}

function back() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("first-f").style.display = "block";
    document.getElementById("back").style.display = "none";
    const codeInput = document.getElementById("code");
    if (codeInput) codeInput.value = "";
}

function initWhatsAppForm() {
    const whatsappForm = document.getElementById("whatsappForm");
    if (!whatsappForm) return;

    whatsappForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;
        const phoneNumber = "201116967317";
        const finalMessage = `📧 الإيميل: ${email}\n\n💬 الرسالة:\n${message}`;
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
        window.open(whatsappURL, "_blank");
        showToast("جاري فتح واتساب...", "#25D366");
        document.getElementById("email").value = "";
        document.getElementById("message").value = "";
    });
}

// ============================================
// إدارة الآراء عبر Firebase السحابية (إضافة، تعديل، حذف)
// ============================================
async function fetchTestimonialsFromCloud() {
    try {
        const response = await fetch(`${FIREBASE_DATABASE_URL}/opinions.json`);
        const data = await response.json();
        if (data) {
            testimonials = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).reverse();
        } else {
            testimonials = [];
        }
        renderTestimonials();
    } catch (e) {
        console.log("خطأ في جلب الآراء من السحابة");
    }
}

async function saveTestimonialToCloud(payload) {
    try {
        let url = `${FIREBASE_DATABASE_URL}/opinions.json`;
        let method = "POST";

        if (editReviewId) {
            url = `${FIREBASE_DATABASE_URL}/opinions/${editReviewId}.json`;
            method = "PUT";
        }

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast(editReviewId ? "تم تعديل الرأي بنجاح!" : "تم نشر الرأي للجميع بنجاح!", "#4CAF50");
            editReviewId = null;
            await fetchTestimonialsFromCloud();
        }
    } catch (e) {
        showToast("حدث خطأ أثناء الاتصال بالسحابة", "#f44336");
    }
}

async function deleteTestimonialFromCloud(id) {
    try {
        const response = await fetch(`${FIREBASE_DATABASE_URL}/opinions/${id}.json`, {
            method: "DELETE"
        });
        if (response.ok) {
            showToast("تم حذف الرأي بنجاح", "#FF9800");
            await fetchTestimonialsFromCloud();
        }
    } catch (e) {
        showToast("تعذر حذف الرأي", "#f44336");
    }
}

// دالة لحذف كل الآراء دفعة واحدة بناءً على طلبك
async function clearAllCloudTestimonials() {
    if (!canManageTestimonials()) return;
    if (confirm("هل أنت متأكد من حذف جميع الآراء من السحابة؟")) {
        try {
            const response = await fetch(`${FIREBASE_DATABASE_URL}/opinions.json`, {
                method: "DELETE"
            });
            if (response.ok) {
                showToast("تم مسح جميع الآراء بنجاح", "#FF9800");
                await fetchTestimonialsFromCloud();
            }
        } catch (e) {
            showToast("تعذر مسح الآراء", "#f44336");
        }
    }
}

function hideAllMenus() {
    document.querySelectorAll(".testimonial-menu").forEach((menu) => {
        menu.style.display = "none";
    });
}

function showTestimonialForm() {
    if (!canManageTestimonials()) return;
    const modal = document.getElementById("testimonial-modal");
    if (!modal) return;
    modal.style.display = "grid";
    modal.setAttribute("aria-hidden", "false");
}

function hideTestimonialForm() {
    const modal = document.getElementById("testimonial-modal");
    const clientNameInput = document.getElementById("client-name-input");
    const clientReviewInput = document.getElementById("client-review-input");
    if (modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }
    if (clientNameInput) clientNameInput.value = "";
    if (clientReviewInput) clientReviewInput.value = "";
    setSelectedRating(5);
    editReviewId = null;
}

function getRatingStars(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 1));
    return Array.from({ length: 5 }, (_, i) => (i < safeRating ? "★" : "☆")).join("");
}

function setSelectedRating(rating) {
    selectedRating = Math.max(1, Math.min(5, Number(rating) || 1));
    document.querySelectorAll(".rating-star").forEach((starButton) => {
        const starValue = Number(starButton.dataset.rating);
        const isActive = starValue <= selectedRating;
        starButton.classList.toggle("active", isActive);
        starButton.textContent = isActive ? "★" : "☆";
    });
}

function renderTestimonials() {
    const grid = document.getElementById("testimonials-grid");
    const countLabel = document.getElementById("testimonials-count");
    if (!grid) return;
    if (countLabel) {
        countLabel.textContent = `${testimonials.length} ${testimonials.length === 1 ? "رأي" : "آراء"}`;
    }

    if (!testimonials.length) {
        grid.innerHTML = '<article class="quote-card quote-card-empty">لا توجد آراء متاحة حاليًا.</article>';
        return;
    }

    grid.innerHTML = testimonials.map((item, index) => {
        const safeName = escapeHtml(item.name || "عميل");
        const safeDate = escapeHtml(item.date || "");
        const safeReview = escapeHtml(item.review || "");
        const avatarLetter = escapeHtml((item.name || "ع").trim().charAt(0) || "ع");
        return `
        <article class="quote-card" style="position: relative;">
            ${canManageTestimonials() ? `
            <button type="button" class="testimonial-menu-btn" onclick="toggleMenu(${index})" aria-label="خيارات">⋯</button>
            <div class="testimonial-menu" id="testimonial-menu-${index}" style="display:none;">
                <button type="button" onclick="editReview('${item.id}', '${safeName.replace(/'/g, "\\'")}', '${safeReview.replace(/'/g, "\\'")}', ${item.rating || 5})">تعديل</button>
                <button type="button" onclick="deleteReview('${item.id}')">حذف</button>
            </div>` : ""}
            <div class="quote-card-head">
                <span class="quote-card-avatar">${avatarLetter}</span>
                <div>
                    <h3>${safeName}</h3>
                    <small>${safeDate}</small>
                </div>
            </div>
            <div class="quote-card-rating" aria-label="التقييم ${item.rating || 1} من 5">${getRatingStars(item.rating)}</div>
            <p>${safeReview}</p>
        </article>
    `;
    }).join("");
}

window.toggleMenu = function(index) {
    const menu = document.getElementById(`testimonial-menu-${index}`);
    const isHidden = menu && menu.style.display === "none";
    hideAllMenus();
    if (menu) menu.style.display = isHidden ? "flex" : "none";
};

window.deleteReview = function(id) {
    if (confirm("هل أنت متأكد من حذف هذا الرأي؟")) {
        deleteTestimonialFromCloud(id);
    }
};

window.editReview = function(id, name, review, rating) {
    editReviewId = id;
    const nameInput = document.getElementById("client-name-input");
    const reviewInput = document.getElementById("client-review-input");
    if (nameInput) nameInput.value = name;
    if (reviewInput) reviewInput.value = review;
    setSelectedRating(rating);
    showTestimonialForm();
};

function initTestimonials() {
    fetchTestimonialsFromCloud();
    setInterval(fetchTestimonialsFromCloud, 4000);

    const addButton = document.getElementById("add-testimonial-btn");
    const saveButton = document.getElementById("save-testimonial-btn");
    const cancelButton = document.getElementById("cancel-testimonial-btn");
    const ratingSelector = document.getElementById("rating-selector");
    const modal = document.getElementById("testimonial-modal");

    if (addButton) {
        addButton.addEventListener("click", () => {
            if (!canManageTestimonials()) return;
            editReviewId = null;
            setSelectedRating(5);
            showTestimonialForm();
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", hideTestimonialForm);
    }

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            if (!canManageTestimonials()) {
                showToast("الإضافة متاحة للمشرف فقط", "#f44336");
                return;
            }
            const nameInput = document.getElementById("client-name-input");
            const reviewInput = document.getElementById("client-review-input");
            const name = nameInput ? nameInput.value.trim() : "";
            const review = reviewInput ? reviewInput.value.trim() : "";

            if (!name || !review) {
                showToast("من فضلك اكتب اسم ولي الأمر والرأي", "#f44336");
                return;
            }

            const payload = {
                name,
                review,
                rating: selectedRating,
                date: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
            };

            showToast("جاري الحفظ...", "#2196f3");
            saveTestimonialToCloud(payload);
            hideTestimonialForm();
        });
    }

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".quote-card")) {
            hideAllMenus();
        }
    });

    if (ratingSelector) {
        ratingSelector.addEventListener("click", (event) => {
            const starButton = event.target.closest(".rating-star");
            if (!starButton) return;
            setSelectedRating(starButton.dataset.rating);
        });
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target.matches("[data-close-modal='true']")) {
                hideTestimonialForm();
            }
        });
    }
}

function initApp() {
    loadAuthState();
    initThemeToggle();
    initTestimonials();
    updateUI();
    initWhatsAppForm();
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// ============================================
// AI CHATBOT
// ============================================
const chatButton = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

if (chatButton && chatWindow && chatMessages && chatInput && sendButton) {
    chatButton.addEventListener('click', () => {
        chatButton.classList.toggle('active');
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';
        sendButton.disabled = true;

        const typingDiv = showTyping();

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: [
                        {
                            role: 'user',
                            content: `${WEBSITE_INFO}\n\nسؤال العميل: ${message}`
                        }
                    ]
                })
            });

            typingDiv.remove();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `خطأ ${response.status}`);
            }

            const data = await response.json();
            const reply = data.content[0].text;
            addMessage(reply, 'bot');

        } catch (error) {
            typingDiv.remove();
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                addMessage('عذراً، الخدمة غير متاحة حالياً بسبب إعدادات الحماية (CORS). يرجى التواصل عبر الواتساب مباشرة!', 'bot');
            } else {
                addMessage(`❌ حصل خطأ: ${error.message}`, 'bot');
            }
        }

        sendButton.disabled = false;
        chatInput.focus();
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? 'AI' : 'أنت';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message bot`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message-content typing-indicator active';
        typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(typingDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}
