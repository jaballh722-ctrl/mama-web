const WHATSAPP_PHONE = "201116967317";
const MEMBER_CODE = "MEMBER2026";

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

function handleWhatsappForm() {
  const whatsappForm = document.getElementById("whatsappForm");
  if (!whatsappForm) return;

  whatsappForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailValue = document.getElementById("email")?.value?.trim() || "غير مذكور";
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

function markExternalLinks() {
  document.querySelectorAll('a[href^="http"]').forEach((anchor) => {
    const isWhatsapp = anchor.href.includes("wa.me");
    if (isWhatsapp) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });
}

function enableMemberAccess() {
  const memberBtn = document.getElementById("memberAccessBtn");
  const menuSection = document.getElementById("menu");
  if (!memberBtn || !menuSection) return;

  memberBtn.addEventListener("click", (event) => {
    if (!menuSection.hidden) return;

    event.preventDefault();
    const enteredCode = window.prompt("من فضلك أدخل كود العضو :");
    if (!enteredCode) return;

    if (enteredCode.trim() === MEMBER_CODE) {
      menuSection.hidden = false;
      showToast("تم الدخول بنجاح");
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    showToast("كود العضو عير صحيح");
  });
}

function setupChatbot() {
  const toggleButton = document.getElementById("chatbotToggle");
  const panel = document.getElementById("chatbotPanel");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const messages = document.getElementById("chatbotMessages");
  if (!toggleButton || !panel || !form || !input || !messages) return;

  const getBotReply = (text) => {
    const normalizedText = text.toLowerCase();
    if (normalizedText.includes("سعر") || normalizedText.includes("تكلفة")) {
      return "أسعار البرامج موجودة في قسم البرامج الشهرية، ولو تحب أوجهك للأنسب ابعتلنا على واتساب.";
    }
    if (normalizedText.includes("جلسة") || normalizedText.includes("تقييم")) {
      return "تقدر تحجز جلسة تقييم مجانية 15 دقيقة من زر واتساب في الصفحة الرئيسية.";
    }
    if (normalizedText.includes("عضو") || normalizedText.includes("كود")) {
      return "قسم الإطعام يظهر بعد إدخال كود العضو الصحيح من زر (دخول كـ عضو).";
    }
    return "شكرًا لرسالتك 🤍 فريقنا هيساعدك فورًا، وتقدر كمان تراسلنا مباشرة على واتساب.";
  };

  const appendMessage = (className, text) => {
    const message = document.createElement("p");
    message.className = className;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  toggleButton.addEventListener("click", () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    toggleButton.setAttribute("aria-expanded", String(!isOpen));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    appendMessage("user-msg", userText);
    const botReply = getBotReply(userText);

    window.setTimeout(() => {
      appendMessage("bot-msg", botReply);
    }, 300);

    form.reset();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  handleWhatsappForm();
  markExternalLinks();
  enableMemberAccess();
  setupChatbot();
});
