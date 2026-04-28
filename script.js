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

الخدمات الإضافية:
- مكان هادئ للدراسة
- وجبات صحية مدعمة
- مراقبة بالكاميرات

الباقات:
1. صح صح - 3000ج/شهر: تحديد المهام + متابعة + وجبة
2. خلاويص - 4000ج/شهر: كل السابق + مؤقت
3. المحقق - 5000ج/شهر: كل السابق + تقييم أسبوعي
4. النووي - 6000ج/شهر: كل السابق + جلسات التركيز

قائمة الطعام: بطاطس مهروسة، فول مدمس، سلطة خضراء، زبادي، فواكه، بيض أومليت

للتواصل: واتساب 201116967317

أجب بالعربية بشكل ودود ومختصر مع استخدام الإيموجي.`;

// ============================================
// كود الموقع الأساسي
// ============================================
const SECRET_CODE = "1234";
const ADMIN_CODE = "admi-n2026";
const REVIEWS_API_BASE_URL = "https://mama-web-reviews-api.vercel.app/api";
const AUTH_STORAGE_KEY = "mama-auth-state";
const LOCAL_TESTIMONIALS_KEY = "mama-local-testimonials";
let isLoggedIn = false;
let isAdmin = false;
let toastTimeout;
const THEME_STORAGE_KEY = "mama-theme";
let testimonials = [];
let reviewPollingInterval = null;
let adminSessionToken = "";
let editIndex = null;
let selectedRating = 5;

function canManageTestimonials() {
    return isLoggedIn && isAdmin;
}

function applyTheme(themeName) {
    const finalTheme = themeName === "alt" ? "alt" : "default";
    document.body.setAttribute("data-theme", finalTheme === "alt" ? "alt" : "default");
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
    const code = codeInput.value.trim();

    if (code === SECRET_CODE) {
        isLoggedIn = true;
        isAdmin = false;
        adminSessionToken = "";
        saveAuthState();
        showToast("✓ تم الدخول بنجاح", "#4CAF50");
        updateUI();
        document.getElementById("back").style.display = "none";
        return;
    }

    try {
        const shouldTryAdminLogin = code === ADMIN_CODE || code.length > 0;
        if (!shouldTryAdminLogin) {
            throw new Error("invalid-admin-code");
        }

        const response = await fetch(`${REVIEWS_API_BASE_URL}/admin-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
            body: JSON.stringify({ adminCode: code })
        });

        if (!response.ok) {
            throw new Error("invalid-admin-code");
        }

        const data = await response.json();
        if (!data?.token) {
            throw new Error("missing-admin-token");
        }

        isLoggedIn = true;
        isAdmin = true;
        adminSessionToken = data.token;
        saveAuthState();
        showToast("✓ تم الدخول كمشرف", "#4CAF50");
        updateUI();
        document.getElementById("back").style.display = "none";
    } catch {
        showToast("✗ كود المشرف غير صحيح", "#f44336");
        codeInput.focus();
        codeInput.select();
    }
}

function logout() {
    document.getElementById("back").style.display = "none";
    isLoggedIn = false;
    isAdmin = false;
    adminSessionToken = "";
    saveAuthState();
    showToast("تم تسجيل الخروج بنجاح", "#FF9800");
    updateUI();
}

function saveAuthState() {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isLoggedIn, isAdmin, adminSessionToken }));
}

function loadAuthState() {
    try {
        const rawData = localStorage.getItem(AUTH_STORAGE_KEY);
        const parsedData = rawData ? JSON.parse(rawData) : {};
        isLoggedIn = Boolean(parsedData.isLoggedIn);
        isAdmin = Boolean(parsedData.isAdmin);
        adminSessionToken = parsedData.adminSessionToken || "";
    } catch {
        isLoggedIn = false;
        isAdmin = false;
        adminSessionToken = "";
    }
}

function updateUI() {
    const menuLink = document.getElementById("menu-link");
    const addTestimonialButton = document.getElementById("add-testimonial-btn");
    if (isLoggedIn) {
        document.getElementById("secret").style.display = "block";
        document.getElementById("first-f").style.display = "none";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "block";
        if (menuLink) menuLink.style.display = "block";
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
    if (isLoggedIn) {
        document.getElementById("secret").style.display = "block";
        document.getElementById("first-f").style.display = "none";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "block";
        document.getElementById("back").style.display = "none";
    } else {
        document.getElementById("secret").style.display = "none";
        document.getElementById("first-f").style.display = "block";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "none";
        document.getElementById("back").style.display = "none";
    }
}

function initWhatsAppForm() {
    const whatsappForm = document.getElementById("whatsappForm");
    if (!whatsappForm) return;

    whatsappForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;
        const phoneNumber = "201116967317";
        const finalMessage = `📧 الإيميل: ${email}

💬 الرسالة:
${message}`;
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
        window.open(whatsappURL, "_blank");
        showToast("جاري فتح واتساب...", "#25D366");
        document.getElementById("email").value = "";
        document.getElementById("message").value = "";
    });
}

function normalizeReviews(rawReviews) {
    if (!Array.isArray(rawReviews)) return [];
    return rawReviews
        .map((item) => ({
            id: item?.id || item?._id || `${item?.name || "review"}-${item?.createdAt || Date.now()}`,
            name: item?.name || "عميل",
            review: item?.review || "",
            rating: Math.max(1, Math.min(5, Number(item?.rating) || 5)),
            date: item?.date || "",
            createdAt: item?.createdAt || ""
        }))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function loadLocalTestimonials() {
    try {
        const rawData = localStorage.getItem(LOCAL_TESTIMONIALS_KEY);
        return normalizeReviews(rawData ? JSON.parse(rawData) : []);
    } catch {
        return [];
    }
}

function saveLocalTestimonials() {
    localStorage.setItem(LOCAL_TESTIMONIALS_KEY, JSON.stringify(testimonials));
}

async function fetchTestimonialsFromServer({ silent = false } = {}) {
    try {
        const response = await fetch(`${REVIEWS_API_BASE_URL}/reviews`, {
            method: "GET",
            cache: "no-store"
        });
        if (!response.ok) throw new Error("reviews-fetch-failed");
        const data = await response.json();
        testimonials = normalizeReviews(data?.reviews || data);
        saveLocalTestimonials();
        renderTestimonials();
    } catch {
        const localReviews = loadLocalTestimonials();
        if (localReviews.length) {
            testimonials = localReviews;
            renderTestimonials();
        }
        if (!silent) {
            showToast("تعذر تحديث الآراء من السيرفر، يتم عرض النسخة المحلية", "#ff9800");
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
    editIndex = null;
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
    const prevButton = document.getElementById("testimonials-prev");
    const nextButton = document.getElementById("testimonials-next");
    const countLabel = document.getElementById("testimonials-count");
    if (!grid) return;
    if (countLabel) {
        countLabel.textContent = `${testimonials.length} ${testimonials.length === 1 ? "رأي" : "آراء"}`;
    }

    if (!testimonials.length) {
        grid.innerHTML = '<article class="quote-card quote-card-empty">لا توجد آراء متاحة حاليًا.</article>';
        grid.classList.remove("is-compact");
        if (prevButton) prevButton.style.display = "none";
        if (nextButton) nextButton.style.display = "none";
        return;
    }

    grid.classList.toggle("is-compact", testimonials.length >= 2);
    if (prevButton) prevButton.style.display = testimonials.length > 3 ? "inline-flex" : "none";
    if (nextButton) nextButton.style.display = testimonials.length > 3 ? "inline-flex" : "none";

    grid.innerHTML = testimonials.map((item, index) => `
        <article class="quote-card">
            ${canManageTestimonials() ? `<button type="button" class="testimonial-menu-btn" data-menu-index="${index}" aria-label="خيارات">⋯</button>
            <div class="testimonial-menu" id="testimonial-menu-${index}" style="display:none;">
                <button type="button" data-action="edit" data-index="${index}">تعديل</button>
                <button type="button" data-action="delete" data-index="${index}">حذف</button>
            </div>` : ""}
            <div class="quote-card-head">
                <span class="quote-card-avatar">${(item.name || "ع").trim().charAt(0)}</span>
                <div>
                    <h3>${item.name}</h3>
                    <small>${item.date || ""}</small>
                </div>
            </div>
            <div class="quote-card-rating" aria-label="التقييم ${item.rating || 1} من 5">${getRatingStars(item.rating)}</div>
            <p>${item.review}</p>
        </article>
    `).join("");
}

function initTestimonials() {
    fetchTestimonialsFromServer();

    const addButton = document.getElementById("add-testimonial-btn");
    const saveButton = document.getElementById("save-testimonial-btn");
    const cancelButton = document.getElementById("cancel-testimonial-btn");
    const grid = document.getElementById("testimonials-grid");
    const prevButton = document.getElementById("testimonials-prev");
    const nextButton = document.getElementById("testimonials-next");
    const ratingSelector = document.getElementById("rating-selector");
    const modal = document.getElementById("testimonial-modal");

    if (addButton) {
        addButton.addEventListener("click", () => {
            if (!canManageTestimonials()) {
                return;
            }
            editIndex = null;
            setSelectedRating(5);
            showTestimonialForm();
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", hideTestimonialForm);
    }

    if (saveButton) {
        saveButton.addEventListener("click", async () => {
            if (!canManageTestimonials()) {
                showToast("الإضافة متاحة للمشرف فقط", "#f44336");
                return;
            }
            const nameInput = document.getElementById("client-name-input");
            const reviewInput = document.getElementById("client-review-input");
            const name = nameInput ? nameInput.value.trim() : "";
            const review = reviewInput ? reviewInput.value.trim() : "";
            const currentEditIndex = editIndex;
            const currentReviewId = currentEditIndex === null ? null : testimonials[currentEditIndex]?.id;

            if (!name || !review) {
                showToast("من فضلك اكتب اسم العميلـ/ـه ورأي العميله", "#f44336");
                return;
            }

            const payload = {
                name,
                review,
                rating: selectedRating,
                date: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }),
                createdAt: new Date().toISOString()
            };
            showToast("جاري نشر الرأي...", "#2196f3");

            try {
                if (currentEditIndex !== null && !currentReviewId) {
                    throw new Error("missing-review-id");
                }
                const method = currentEditIndex === null ? "POST" : "PUT";
                const endpoint = currentEditIndex === null
                    ? `${REVIEWS_API_BASE_URL}/reviews`
                    : `${REVIEWS_API_BASE_URL}/reviews/${encodeURIComponent(currentReviewId)}`;
                const response = await fetch(endpoint, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${adminSessionToken}`
                    },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error("review-save-failed");
                await fetchTestimonialsFromServer({ silent: true });
                hideTestimonialForm();
                showToast("تم نشر الرأي بنجاح", "#4CAF50");
            } catch {
                showToast("فشل نشر الرأي على السيرفر. حاول مرة تانية.", "#f44336");
            }
        });
    }

    if (grid) {
        grid.addEventListener("click", (event) => {
            const menuButton = event.target.closest(".testimonial-menu-btn");
            const actionButton = event.target.closest(".testimonial-menu button");

            if (menuButton) {
                const menuIndex = menuButton.dataset.menuIndex;
                const menu = document.getElementById(`testimonial-menu-${menuIndex}`);
                if (!menu) return;
                const isHidden = menu.style.display === "none";
                hideAllMenus();
                menu.style.display = isHidden ? "flex" : "none";
                return;
            }

            if (actionButton) {
                if (!canManageTestimonials()) {
                    hideAllMenus();
                    return;
                }
                const action = actionButton.dataset.action;
                const index = Number(actionButton.dataset.index);

                if (action === "edit") {
                    const selected = testimonials[index];
                    if (!selected) return;
                    const nameInput = document.getElementById("client-name-input");
                    const reviewInput = document.getElementById("client-review-input");
                    if (nameInput) nameInput.value = selected.name;
                    if (reviewInput) reviewInput.value = selected.review;
                    setSelectedRating(selected.rating || 1);
                    editIndex = index;
                    showTestimonialForm();
                }

                if (action === "delete") {
                    const reviewToDelete = testimonials[index];
                    if (!reviewToDelete) return;
                    fetch(`${REVIEWS_API_BASE_URL}/reviews/${encodeURIComponent(reviewToDelete.id)}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${adminSessionToken}`
                        }
                    }).then((response) => {
                        if (!response.ok) throw new Error("review-delete-failed");
                        testimonials.splice(index, 1);
                        saveLocalTestimonials();
                        renderTestimonials();
                    }).catch(() => {
                        testimonials.splice(index, 1);
                        saveLocalTestimonials();
                        renderTestimonials();
                        showToast("تم حذف الرأي محليًا فقط بسبب مشكلة اتصال", "#ff9800");
                    });
                }

                hideAllMenus();
            }
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

    if (prevButton && grid) {
        prevButton.addEventListener("click", () => {
            grid.scrollBy({ left: -280, behavior: "smooth" });
        });
    }

    if (nextButton && grid) {
        nextButton.addEventListener("click", () => {
            grid.scrollBy({ left: 280, behavior: "smooth" });
        });
    }

    setSelectedRating(5);
    if (reviewPollingInterval) clearInterval(reviewPollingInterval);
    reviewPollingInterval = setInterval(() => {
        fetchTestimonialsFromServer({ silent: true });
    }, 4000);
}

function initApp() {
    loadAuthState();
    initThemeToggle();
    testimonials = loadLocalTestimonials();
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
// AI CHATBOT - مش هيشتغل بسبب CORS
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
            // رسالة توضيحية للمستخدم
            if (chatMessages.children.length === 0) {
                addMessage('⚠️ تنبيه: الـ AI مش هيشتغل على GitHub Pages بسبب CORS\n\n✅ الحل: ارفع الموقع على Netlify أو Vercel', 'bot');
            }
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
            // محاولة الاتصال (مش هتنجح بسبب CORS)
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
            
            // رسالة خطأ CORS
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                addMessage('❌ مشكلة CORS!\n\n🔧 الحل:\n\n1. ارفع الموقع على Netlify\n2. اعمل ملف netlify/functions/chat.js\n3. حط فيه الـ API Key\n4. هيشتغل تمام!\n\n📺 شوف الفيديو: bit.ly/netlify-claude', 'bot');
            } else {
                addMessage(`❌ حصل خطأ: ${error.message}`, 'bot');
            }
            
            console.error('AI Error:', error);
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
        messageDiv.className = 'message bot';
        
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

    console.log('⚠️ AI Chatbot مش هيشتغل على GitHub Pages بسبب CORS');
    console.log('✅ ارفع الموقع على Netlify عشان يشتغل');
}
