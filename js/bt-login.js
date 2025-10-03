        import {
            initializeApp
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import {
            getAuth,
            onAuthStateChanged
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import {
            getDatabase,
            ref,
            get
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: "AIzaSyDKTwIYWrKVI2chV2NT6AuoOScslidkPPE",
            authDomain: "pbstest-120f0.firebaseapp.com",
            databaseURL: "https://pbstest-120f0-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "pbstest-120f0",
            storageBucket: "pbstest-120f0.firebasestorage.app",
            messagingSenderId: "952039250071",
            appId: "1:952039250071:web:2863a90232ae62646671d2",
            measurementId: "G-17Y32259ZR"
        };

        // === Ініціалізація Firebase один раз ===
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

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