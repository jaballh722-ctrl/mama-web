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
            if (isLoggedIn) {
                document.getElementById("secret").style.display = "block";
                document.getElementById("first-f").style.display = "none";
                document.getElementById("loginBox").style.display = "none";
                document.getElementById("toexit").style.display = "block";
            } else {
                document.getElementById("secret").style.display = "none";
                document.getElementById("first-f").style.display = "block";
                document.getElementById("loginBox").style.display = "none";
                document.getElementById("toexit").style.display = "none";
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
