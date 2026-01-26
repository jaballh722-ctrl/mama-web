// ============================================
// 🔑 ضع الـ Anthropic API Key هنا
// ============================================
const ANTHROPIC_API_KEY = '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';

// معلومات الموقع للـ AI
const WEBSITE_CONTEXT = `أنت مساعد ذكي لموقع "متابعة دراسية" - خدمة متابعة دراسية للمرحلة الابتدائية.

📚 الخدمات الأساسية:
- تحديد المهام الدراسية اليومية ومتابعتها
- استخدام مؤقتات زمنية لمتابعة الإنجاز
- تقييم أكاديمي أسبوعي شامل
- جلسات تنمية مهارات الانتباه والتركيز
- جلسات تنمية مهارات التخطيط والتنفيذ

🎯 الخدمات الإضافية:
- توفير مكان هادئ بمكتب للدراسة
- وجبات صحية مدعمة بأسعار غير ربحية
- مراقبة بالكاميرات على مدار الساعة

💰 الباقات المتاحة:

1️⃣ باقة "صح صح" - 3000 جنيه/شهر
✓ تحديد المهام
✓ متابعة الإنجاز
✓ وجبة مدعمة

2️⃣ باقة "خلاويص" - 4000 جنيه/شهر
✓ كل مميزات "صح صح"
✓ مؤقت لمتابعة الإنجاز

3️⃣ باقة "المحقق" - 5000 جنيه/شهر
✓ كل مميزات "خلاويص"
✓ تقييم أكاديمي أسبوعي

4️⃣ باقة "النووي" - 6000 جنيه/شهر (الأفضل)
✓ كل مميزات "المحقق"
✓ جلسات زيادة التركيز والانتباه

📱 للتواصل:
واتساب 201116967317

تعليمات:
- كن ودوداً ومختصراً
- استخدم إيموجي مناسب
- أجب بالعربية فقط
- إذا سألوا عن الحجز، وجههم لنموذج الطلب في الموقع`;

// ============================================
// كود الموقع الأساسي
// ============================================
const SECRET_CODE = "1234";
let isLoggedIn = false;

function showToast(message, bgColor) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    if (bgColor) {
        toast.style.backgroundColor = bgColor;
    } else {
        toast.style.backgroundColor = "#333";
    }
    toast.style.visibility = "visible";
    setTimeout(function () {
        toast.style.visibility = "hidden";
    }, 3000);
}

function handleForm(form) {
    showToast("سيتم التواصل معك قريبًا!");
    setTimeout(function () {
        form.submit();
    }, 500);
    return false;
}

function openLogin() {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("first-f").style.display = "none";
    document.getElementById("back").style.display = "block";
}

function login() {
    const code = document.getElementById("code").value;
    if (code === SECRET_CODE) {
        isLoggedIn = true;
        showToast("✓ تم الدخول بنجاح", "#4CAF50");
        updateUI();
        document.getElementById("back").style.display = "none";
    } else {
        showToast("✗ الكود خاطئ حاول مرة اخرى", "#f44336");
    }
}

function logout() {
    document.getElementById("back").style.display = "none";
    isLoggedIn = false;
    showToast("تم تسجيل الخروج بنجاح", "#FF9800");
    updateUI();
}

function updateUI() {
    const menuLink = document.getElementById("menu-link");
    if (isLoggedIn) {
        document.getElementById("secret").style.display = "block";
        document.getElementById("first-f").style.display = "none";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "block";
        menuLink.style.display = "block";
    } else {
        document.getElementById("secret").style.display = "none";
        document.getElementById("first-f").style.display = "block";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "none";
        menuLink.style.display = "none";
    }
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

window.addEventListener("DOMContentLoaded", function () {
    updateUI();
});

document.getElementById("whatsappForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const phoneNumber = "201116967317";
    const finalMessage = "📧 الإيميل: " + email + "\n\n" + "💬 الرسالة:\n" + message;
    const whatsappURL = "https://wa.me/" + phoneNumber + "?text=" + encodeURIComponent(finalMessage);
    window.open(whatsappURL, "_blank");
    showToast("جاري فتح واتساب...", "#25D366");
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
});

// ============================================
// AI CHATBOT CODE - CLAUDE VERSION
// ============================================
const chatButton = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

// فتح/إغلاق الشات
chatButton.addEventListener('click', () => {
    chatButton.classList.toggle('active');
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
        chatInput.focus();
    }
});

// إرسال الرسالة
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // إضافة رسالة المستخدم
    addMessage(message, 'user');
    chatInput.value = '';
    sendButton.disabled = true;

    // التحقق من API Key
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.length < 20) {
        setTimeout(() => {
            addMessage('⚠️ عذراً! يجب إضافة Anthropic API Key أولاً.\n\nاذهب إلى السطر 5 في ملف script.js وضع الـ Key الكامل بتاعك.', 'bot');
            sendButton.disabled = false;
        }, 500);
        return;
    }

    // إظهار typing indicator
    const typingDiv = showTypingIndicator();

    try {
        // استدعاء Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system: WEBSITE_CONTEXT,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        // إزالة typing indicator
        typingDiv.remove();

        if (data.error) {
            addMessage(`❌ خطأ: ${data.error.message}`, 'bot');
        } else if (data.content && data.content[0]) {
            const botReply = data.content[0].text;
            addMessage(botReply, 'bot');
        } else {
            addMessage('❌ عذراً، لم أتمكن من الحصول على رد.', 'bot');
        }

    } catch (error) {
        typingDiv.remove();
        addMessage('❌ عذراً، حدث خطأ في الاتصال. تأكد من صحة الـ API Key وحاول مرة أخرى.', 'bot');
        console.error('Error:', error);
    }

    sendButton.disabled = false;
    chatInput.focus();
}

// إضافة رسالة للشات
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

// Typing indicator
function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message-content typing-indicator active';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(typingDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

// Events
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

console.log('🤖 Claude AI Chatbot initialized successfully!');
console.log('💡 API Key is set and ready to use!');
