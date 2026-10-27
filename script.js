// ============================================
// 🔑 إعدادات Firebase السحابية للآراء
// ============================================
const FIREBASE_DATABASE_URL = "https://mama-website-7a250-default-rtdb.firebaseio.com";

// معلومات الموقع والـ AI
const ANTHROPIC_API_KEY = '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';
const WEBSITE_INFO = `أنت مساعد ذكي لموقع "متابعة دراسية" للمرحلة الابتدائية. للتواصل: واتساب 201116967317`;

const SECRET_CODE = "1234"; // كود العضو
const ADMIN_SECRET_CODE = "5678"; // كود المشرف
const AUTH_STORAGE_KEY = "mama-auth-state";
let isLoggedIn = false;
let isAdmin = false;
let toastTimeout;
const THEME_STORAGE_KEY = "mama-theme";
let testimonials = [];
let selectedRating = 5;

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

// الثيمات
function applyTheme(themeName) {
    const finalTheme = themeName === "alt" ? "alt" : "default";
    document.body.setAttribute("data-theme", finalTheme);
    localStorage.setItem(THEME_STORAGE_KEY, finalTheme);
}

function initThemeToggle() {
    const themeToggleButton = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "default";
    applyTheme(savedTheme);
    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", () => {
            const current = document.body.getAttribute("data-theme");
            applyTheme(current === "alt" ? "default" : "alt");
        });
    }
}

function showToast(message, bgColor) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = message;
        toast.style.backgroundColor = bgColor || "#333";
        toast.style.visibility = "visible";
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.visibility = "hidden";
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

function login() {
    const codeInput = document.getElementById("code");
    if (!codeInput) return;
    const code = codeInput.value.trim();

    if (!code) {
        showToast("من فضلك أدخل كود الدخول أولًا", "#f44336");
        return;
    }

    if (code === SECRET_CODE) {
        isLoggedIn = true;
        isAdmin = false;
        saveAuthState();
        showToast("✓ تم الدخول كعضو بنجاح", "#4CAF50");
        updateUI();
        document.getElementById("back").style.display = "none";
        return;
    }

    if (code === ADMIN_SECRET_CODE) {
        isLoggedIn = true;
        isAdmin = true;
        saveAuthState();
        showToast("✓ تم الدخول كمشرف بنجاح", "#4CAF50");
        updateUI();
        document.getElementById("back").style.display = "none";
        return;
    }

    showToast("✗ كود الدخول غير صحيح", "#f44336");
    codeInput.focus();
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
}

// ============================================
// نظام السحابة (Firebase Realtime Database)
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
        console.log("خطأ في جلب الآراء");
    }
}

async function saveTestimonialToCloud(payload) {
    try {
        const response = await fetch(`${FIREBASE_DATABASE_URL}/opinions.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            showToast("تم نشر الرأي للجميع بنجاح!", "#4CAF50");
            await fetchTestimonialsFromCloud(); // تحديث فوري للقائمة بعد الحفظ
        }
    } catch (e) {
        showToast("حدث خطأ أثناء الاتصال بالسحابة", "#f44336");
    }
}

async function deleteTestimonialFromCloud(id) {
    try {
        await fetch(`${FIREBASE_DATABASE_URL}/opinions/${id}.json`, {
            method: "DELETE"
        });
        showToast("تم حذف الرأي بنجاح", "#FF9800");
        await fetchTestimonialsFromCloud();
    } catch (e) {
        showToast("تعذر حذف الرأي", "#f44336");
    }
}

function showTestimonialForm() {
    if (!canManageTestimonials()) return;
    const modal = document.getElementById("testimonial-modal");
    if (modal) modal.style.display = "grid";
}

function hideTestimonialForm() {
    const modal = document.getElementById("testimonial-modal");
    if (modal) modal.style.display = "none";
    document.getElementById("client-name-input").value = "";
    document.getElementById("client-review-input").value = "";
    setSelectedRating(5);
}

function getRatingStars(rating) {
    const r = Math.max(1, Math.min(5, Number(rating) || 1));
    return Array.from({ length: 5 }, (_, i) => (i < r ? "★" : "☆")).join("");
}

function setSelectedRating(rating) {
    selectedRating = Math.max(1, Math.min(5, Number(rating) || 1));
    document.querySelectorAll(".rating-star").forEach((btn) => {
        const val = Number(btn.dataset.rating);
        btn.textContent = val <= selectedRating ? "★" : "☆";
    });
}

function renderTestimonials() {
    const grid = document.getElementById("testimonials-grid");
    const countLabel = document.getElementById("testimonials-count");
    if (!grid) return;
    if (countLabel) countLabel.textContent = `${testimonials.length} رأي`;

    if (!testimonials.length) {
        grid.innerHTML = '<article class="quote-card quote-card-empty">لا توجد آراء متاحة حاليًا.</article>';
        return;
    }

    grid.innerHTML = testimonials.map((item, index) => `
        <article class="quote-card" style="position: relative; padding-bottom: 30px;">
            ${canManageTestimonials() ? `
            <button type="button" onclick="deleteReview('${item.id}')" style="position: absolute; left: 10px; top: 10px; background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">حذف</button>` : ""}
            <div class="quote-card-head">
                <span class="quote-card-avatar">${escapeHtml(item.name.charAt(0))}</span>
                <div>
                    <h3>${escapeHtml(item.name)}</h3>
                    <small>${escapeHtml(item.date)}</small>
                </div>
            </div>
            <div class="quote-card-rating">${getRatingStars(item.rating)}</div>
            <p>${escapeHtml(item.review)}</p>
        </article>
    `).join("");
}

window.deleteReview = function(id) {
    if (confirm("هل أنت متأكد من حذف هذا الرأي؟")) {
        deleteTestimonialFromCloud(id);
    }
};

function initTestimonials() {
    fetchTestimonialsFromCloud();
    setInterval(fetchTestimonialsFromCloud, 4000); // تحديث دوري كل 4 ثواني

    const addButton = document.getElementById("add-testimonial-btn");
    const saveButton = document.getElementById("save-testimonial-btn");
    const cancelButton = document.getElementById("cancel-testimonial-btn");
    const ratingSelector = document.getElementById("rating-selector");

    if (addButton) addButton.addEventListener("click", showTestimonialForm);
    if (cancelButton) cancelButton.addEventListener("click", hideTestimonialForm);

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            const name = document.getElementById("client-name-input").value.trim();
            const review = document.getElementById("client-review-input").value.trim();
            if (!name || !review) {
                showToast("من فضلك اكتب الاسم والرأي", "#f44336");
                return;
            }
            const payload = {
                name,
                review,
                rating: selectedRating,
                date: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
            };
            saveTestimonialToCloud(payload);
            hideTestimonialForm();
        });
    }

    if (ratingSelector) {
        ratingSelector.addEventListener("click", (e) => {
            const btn = e.target.closest(".rating-star");
            if (btn) setSelectedRating(btn.dataset.rating);
        });
    }
}

function initApp() {
    loadAuthState();
    initThemeToggle();
    initTestimonials();
    updateUI();
}

window.addEventListener("DOMContentLoaded", initApp);
