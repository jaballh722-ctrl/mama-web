const WHATSAPP_PHONE = "201116967317";
const MEMBER_CODE = "MEMBER2026";

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, bgColor = "#1f2937") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.backgroundColor = bgColor;
  toast.style.visibility = "visible";
  setTimeout(() => {
    toast.style.visibility = "hidden";
  }, 2600);
}

/* ============================================================
   WHATSAPP FORM
   ============================================================ */
function handleWhatsappForm() {
  const whatsappForm = document.getElementById("whatsappForm");
  if (!whatsappForm) return;

  whatsappForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailValue =
      document.getElementById("email")?.value?.trim() || "غير مذكور";
    const messageValue = document.getElementById("message")?.value?.trim();

    if (!messageValue) {
      showToast("من فضلك اكتب رسالتك أولًا.", "#c0392b");
      return;
    }

    const finalMessage = `مرحباً، أريد الاستفسار عن خدمات المتابعة الدراسية.%0A%0A📧 البريد الإلكتروني: ${encodeURIComponent(emailValue)}%0A💬 الرسالة: ${encodeURIComponent(messageValue)}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${finalMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    showToast("يتم فتح واتساب الآن...", "#25D366");
    whatsappForm.reset();
  });
}

/* ============================================================
   EXTERNAL LINKS
   ============================================================ */
function markExternalLinks() {
  document.querySelectorAll('a[href^="http"]').forEach((anchor) => {
    const isWhatsapp = anchor.href.includes("wa.me");
    if (isWhatsapp) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });
}

/* ============================================================
   MEMBER ACCESS — MODAL بدل window.prompt
   ============================================================ */
function enableMemberAccess() {
  const memberBtn    = document.getElementById("memberAccessBtn");
  const menuSection  = document.getElementById("menu");
  const modal        = document.getElementById("memberModal");
  const codeInput    = document.getElementById("memberCodeInput");
  const submitBtn    = document.getElementById("modalSubmitBtn");
  const backBtn      = document.getElementById("modalBackBtn");
  const errorMsg     = document.getElementById("modalError");

  if (!memberBtn || !menuSection || !modal) return;

  /* ---- فتح الموديل ---- */
  memberBtn.addEventListener("click", (event) => {
    event.preventDefault();

    // لو العضو سبق وسجّل دخول → زرار الخروج بيشتغل مباشرة بدون موديل
    if (memberBtn.dataset.loggedIn === "true") {
      logoutMember();
      return;
    }

    openModal();
  });

  /* ---- دخول بالكود ---- */
  submitBtn.addEventListener("click", () => {
    attemptLogin();
  });

  /* ---- إدخال بالكيبورد (Enter) ---- */
  codeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
  });

  /* ---- رجوع / إلغاء ---- */
  backBtn.addEventListener("click", () => {
    closeModal();
  });

  /* ---- إغلاق بالنقر على الخلفية ---- */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  /* ---- إغلاق بـ Escape ---- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* ---- الدوال الداخلية ---- */
  function openModal() {
    codeInput.value = "";
    errorMsg.hidden = true;
    codeInput.classList.remove("input-error");
    modal.hidden = false;
    // تأخير بسيط عشان الفوكس يشتغل بعد ظهور الموديل
    setTimeout(() => codeInput.focus(), 60);
  }

  function closeModal() {
    modal.hidden = true;
    codeInput.value = "";
    errorMsg.hidden = true;
    codeInput.classList.remove("input-error");
  }

  function attemptLogin() {
    const entered = codeInput.value.trim();

    if (!entered) {
      shakeInput();
      return;
    }

    if (entered === MEMBER_CODE) {
      closeModal();
      // فتح صفحة الإطعام
      menuSection.hidden = false;
      showToast("تم فتح صفحة الإطعام بنجاح ✅", "#2ea97f");
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      // تحويل الزرار لـ "خروج من العضوية"
      memberBtn.textContent = "خروج من العضوية";
      memberBtn.classList.remove("primary-link");
      memberBtn.classList.add("logout-link");
      memberBtn.dataset.loggedIn = "true";
      memberBtn.removeAttribute("href");
    } else {
      // كود خاطئ
      errorMsg.hidden = false;
      shakeInput();
      codeInput.value = "";
      setTimeout(() => codeInput.focus(), 50);
    }
  }

  function shakeInput() {
    codeInput.classList.remove("input-error");
    // إعادة الكلاس بعد إزالته لتشغيل الأنيميشن من جديد
    void codeInput.offsetWidth;
    codeInput.classList.add("input-error");
  }

  function logoutMember() {
    // إخفاء صفحة الإطعام
    menuSection.hidden = true;
    // إعادة الزرار لحالته الأصلية
    memberBtn.textContent = "دخول كـ عضو";
    memberBtn.classList.add("primary-link");
    memberBtn.classList.remove("logout-link");
    memberBtn.dataset.loggedIn = "false";
    memberBtn.setAttribute("href", "#menu");
    showToast("تم تسجيل الخروج بنجاح.", "#1f2937");
    // رجوع لأعلى الصفحة
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  handleWhatsappForm();
  markExternalLinks();
  enableMemberAccess();
});
