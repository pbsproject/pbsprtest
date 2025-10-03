        import {
            initializeApp
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
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

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        get(ref(db, "mods")).then(snapshot => {
            const mods = [];
            snapshot.forEach(child => {
                mods.push({
                    id: child.key,
                    ...child.val()
                });
            });

            // Сортируем по createdAt, новее сверху
            mods.sort((a, b) => b.createdAt - a.createdAt);

            console.log("Загруженные моды (отсортированные):", mods);

            const container = document.querySelector("#newdownloads .departments-grid");
            if (!container) {
                console.error("Контейнер .departments-grid не найден");
                return;
            }

            // Отрисовываем все моды (без slice)
            mods.forEach(mod => {
                const card = document.createElement("div");
                card.className = "department-card fade-in-up";
                card.style = "display: flex; flex-direction: column;";

                card.innerHTML = `
      <img src="${mod.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}" 
           alt="${mod.title}" 
           style="width:100%; border-radius: var(--radius-md); margin-bottom: var(--space-md);">

      <h3 class="department-title">${mod.title}</h3>

      <p class="department-description">
        ${mod.description || "Без описания."}
      </p>

      <a href="mod.html?id=${mod.id}" 
         class="btn btn-primary" 
         style="position: relative; overflow: hidden; margin-left: auto;">
        <span>Подробнее</span>
      </a>
    `;

                container.appendChild(card);
            });
        }).catch(error => {
            console.error("Ошибка при загрузке модов:", error);
        });