const WHATSAPP_PHONE = "201116967317";

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

window.addEventListener("DOMContentLoaded", () => {
  handleWhatsappForm();
  markExternalLinks();
});
