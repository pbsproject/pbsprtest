        // === Кнопка авторизації / профілю ===
        const authBtn = document.getElementById("authBtn");

        // початково кнопка "Увійти"
        authBtn.href = "login.html";
        authBtn.textContent = "Войти";

        onAuthStateChanged(auth, (user) => {
            if (user) {
                authBtn.href = "profile.html";
                authBtn.textContent = "Профиль";
            }
        });