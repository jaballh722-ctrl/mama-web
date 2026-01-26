// ============================================
// 🔑 ضع API Key هنا
// ============================================
const ANTHROPIC_API_KEY = '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'; // من https://console.anthropic.com/

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
let isLoggedIn = false;

function showToast(message, bgColor) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.backgroundColor = bgColor || "#333";
    toast.style.visibility = "visible";
    setTimeout(() => toast.style.visibility = "hidden", 3000);
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
let conversationHistory = [];

const chatButton = document.getElementById('chatbotButton');
const chatWindow = document.getElementById('chatbotWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

if (chatButton && chatWindow && chatMessages && chatInput && sendButton) {
    
    // فتح/إغلاق النافذة
    chatButton.addEventListener('click', () => {
        chatButton.classList.toggle('active');
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
        }
    });

    // إرسال رسالة
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';
        sendButton.disabled = true;

        // فحص API Key
        if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
            setTimeout(() => {
                addMessage('⚠️ لازم تحط API Key الأول!\n\n1. روح https://console.anthropic.com/\n2. سجل دخول\n3. اعمل API Key جديد\n4. حطه في السطر 5 في ملف script.js', 'bot');
                sendButton.disabled = false;
            }, 500);
            return;
        }

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
            let errorMsg = '❌ حصل خطأ في الاتصال.\n';
            
            if (error.message.includes('401')) {
                errorMsg += '\n🔑 API Key غلط! تأكد منه.';
            } else if (error.message.includes('429')) {
                errorMsg += '\n⏰ وصلت للحد الأقصى، استنى شوية.';
            } else if (error.message.includes('network')) {
                errorMsg += '\n🌐 مشكلة في النت، تأكد من الاتصال.';
            } else {
                errorMsg += `\n${error.message}`;
            }
            
            addMessage(errorMsg, 'bot');
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

    console.log('✅ AI Chatbot جاهز للاستخدام!');
    console.log('📝 حط الـ API Key في السطر 5');
    console.log('🔗 https://console.anthropic.com/settings/keys');
}
