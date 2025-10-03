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