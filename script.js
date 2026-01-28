// ============================================
// 🔑 ضع API Key هنا
// ============================================
const ANTHROPIC_API_KEY = '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';

// معلومات الموقع - محدّثة للنسخة الأونلاين
const WEBSITE_INFO = `أنت مساعد ذكي لموقع "متابعة دراسية أونلاين" للمرحلة الابتدائية.

الخدمات الأساسية (أونلاين):
- تحديد المهام الدراسية اليومية ومتابعتها عن بُعد
- استخدام مؤقتات زمنية لمتابعة الإنجاز
- تقييم أكاديمي أسبوعي
- جلسات تنمية الانتباه والتركيز (أونلاين)
- جلسات التخطيط والتنفيذ (أونلاين)

الباقات (للأعضاء فقط):
1. صح صح: تحديد المهام + متابعة
2. خلاويص: كل السابق + مؤقت
3. المحقق: كل السابق + تقييم أسبوعي
4. النووي: كل السابق + جلسات التركيز

للتواصل: واتساب 201116967317

أجب بالعربية بشكل ودود ومختصر مع استخدام الإيموجي.`;

// ============================================
// كود الموقع الأساسي
// ============================================
const SECRET_CODE = "1234";
let isLoggedIn = false;

function showToast(message, bgColor) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = message;
        toast.style.backgroundColor = bgColor || "#333";
        toast.style.visibility = "visible";
        setTimeout(() => toast.style.visibility = "hidden", 3000);
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
    const priceElements = document.querySelectorAll(".package-price");
    const nonMemberMessage = document.querySelectorAll(".non-member-msg");
    
    if (isLoggedIn) {
        // إظهار الأسعار للأعضاء
        document.getElementById("first-f").style.display = "none";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "block";
        
        // إظهار الأسعار
        priceElements.forEach(el => {
            el.style.display = "block";
        });
        
        // إخفاء رسالة غير الأعضاء
        nonMemberMessage.forEach(el => {
            el.style.display = "none";
        });
        
    } else {
        // إخفاء الأسعار عن غير الأعضاء
        document.getElementById("first-f").style.display = "block";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "none";
        
        // إخفاء الأسعار
        priceElements.forEach(el => {
            el.style.display = "none";
        });
        
        // إظهار رسالة غير الأعضاء
        nonMemberMessage.forEach(el => {
            el.style.display = "block";
        });
    }
}

function back() {
    if (isLoggedIn) {
        document.getElementById("first-f").style.display = "none";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "block";
        document.getElementById("back").style.display = "none";
    } else {
        document.getElementById("first-f").style.display = "block";
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("toexit").style.display = "none";
        document.getElementById("back").style.display = "none";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    updateUI();
    
    // WhatsApp Form
    const whatsappForm = document.getElementById("whatsappForm");
    if (whatsappForm) {
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
});

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
                addMessage('❌ مشكلة CORS!\n\n🔧 الحل:\n\n1. ارفع الموقع على Netlify\n2. اعمل ملف netlify/functions/chat.js\n3. حط فيه الـ API Key\n4. هيشتغل تمام!', 'bot');
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
}
