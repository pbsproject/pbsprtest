            // DOM
            const loginPanel = document.getElementById('loginPanel');
            const adminPanel = document.getElementById('adminPanel');
            const modsApprovalPanel = document.getElementById('modsApprovalPanel');
            const usersPanel = document.getElementById('usersPanel');
            const loginBtn = document.getElementById('loginBtn');
            const loginError = document.getElementById('loginError');
            const logoutBtn = document.getElementById('logoutBtn');
            const addModForm = document.getElementById('addModForm');
            const formMsg = document.getElementById('formMsg');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const modsList = document.getElementById('modsList');
            const usersTableBody = document.querySelector("#usersTable tbody");

            // Прев’ю картинок
            const imagesField = document.getElementById('images');
            const previewWrap = document.getElementById('previewWrap');
            const preview = document.getElementById('preview');

            imagesField.addEventListener('input', () => {
                const urls = imagesField.value.split(',').map(u => u.trim()).filter(Boolean);
                if (urls.length > 0) {
                    previewWrap.classList.remove('hidden');
                    preview.innerHTML = urls.map((u, i) => `
            <div class="gallery-item" data-url="${u}">
                <img class="gallery-image" src="${u}">
                <div class="gallery-overlay"><span>Превью ${i+1}</span></div>
            </div>`).join('');
                    document.querySelectorAll('.gallery-item').forEach(item => {
                        item.onclick = () => {
                            const url = item.dataset.url;
                            const lightbox = document.createElement('div');
                            lightbox.className = 'lightbox';
                            const img = document.createElement('img');
                            img.src = url;
                            const closeBtn = document.createElement('button');
                            closeBtn.className = 'lightbox-close';
                            closeBtn.textContent = '×';
                            lightbox.appendChild(img);
                            lightbox.appendChild(closeBtn);
                            document.body.appendChild(lightbox);
                            setTimeout(() => lightbox.classList.add('show'), 10);
                            closeBtn.onclick = () => {
                                lightbox.classList.remove('show');
                                setTimeout(() => lightbox.remove(), 300);
                            };
                            lightbox.onclick = e => {
                                if (e.target === lightbox) {
                                    lightbox.classList.remove('show');
                                    setTimeout(() => lightbox.remove(), 300);
                                }
                            }
                        };
                    });
                } else {
                    previewWrap.classList.add('hidden');
                    preview.innerHTML = '';
                }
            });

            // --- Login/Logout ---
            loginBtn.addEventListener('click', async () => {
                try {
                    const email = emailInput.value.trim();
                    const password = passwordInput.value.trim();
                    await signInWithEmailAndPassword(auth, email, password);
                } catch {
                    loginError.style.display = 'block';
                    loginError.textContent = "Ошибка входа. Проверьте Email/Пароль.";
                }
            });
            logoutBtn.addEventListener('click', () => signOut(auth));

            onAuthStateChanged(auth, async user => {
                if (user) {
                    const adminSnap = await get(ref(db, `admins/${user.uid}`));
                    if (adminSnap.exists()) {
                        loginPanel.classList.add('hidden');
                        adminPanel.classList.remove('hidden');
                        modsApprovalPanel.classList.remove('hidden');
                        usersPanel.classList.remove('hidden');
                        loadModsForApproval();
                        loadUsers();
                    } else {
                        alert("Доступ только для администраторов");
                        signOut(auth);
                    }
                } else {
                    loginPanel.classList.remove('hidden');
                    adminPanel.classList.add('hidden');
                    modsApprovalPanel.classList.add('hidden');
                    usersPanel.classList.add('hidden');
                }
            });

            // --- Add Mod (адмінські моди у /mods) ---
            addModForm.addEventListener('submit', async e => {
                e.preventDefault();
                const mod = {
                    title: document.getElementById('title').value,
                    type: document.getElementById('type').value,
                    description: document.getElementById('description').value,
                    modelAuthor: document.getElementById('modelAuthor').value,
                    convertAuthor: document.getElementById('convertAuthor').value,
                    weight: document.getElementById('weight').value,
                    download: document.getElementById('download').value,
                    images: document.getElementById('images').value.split(',').map(u => u.trim()),
                    createdAt: Date.now(),
                    authorUid: auth.currentUser.uid
                };
                try {
                    const newRef = push(ref(db, 'mods'));
                    await set(newRef, mod);
                    formMsg.style.color = "#8bffb3";
                    formMsg.textContent = "✅ Опубликовано!";
                    addModForm.reset();
                    previewWrap.classList.add('hidden');
                    preview.innerHTML = '';
                } catch (err) {
                    console.error(err);
                    formMsg.style.color = "#ff8b8b";
                    formMsg.textContent = "Ошибка при сохранении";
                }
            });

            // --- Mods for approval ---
            async function loadModsForApproval() {
                modsList.innerHTML = '';
                const snap = await get(ref(db, 'modsForApproval'));
                if (snap.exists()) {
                    const mods = snap.val();
                    Object.entries(mods).forEach(([id, mod]) => {
                        const div = document.createElement('div');
                        div.className = 'panel-item';
                        div.innerHTML = `<span>${mod.title} (${mod.type})</span>
            <div>
                <button class="btn btn-primary">Посмотреть</button>
            </div>`;
                        const btn = div.querySelector("button");
                        btn.onclick = () => openModal(id, mod);
                        modsList.appendChild(div);
                    });
                } else {
                    modsList.innerHTML = '<i>Нет модов на модерацию</i>';
                }
            }

            const modal = document.getElementById("modModal");
            const closeModal = modal.querySelector(".modal-close");
            let currentModId = null;

            function openModal(id, mod) {
                currentModId = id;
                modal.style.display = 'block';
                document.getElementById("modalTitle").textContent = mod.title;
                document.getElementById("modalType").textContent = mod.type;
                document.getElementById("modalModelAuthor").textContent = mod.modelAuthor;
                document.getElementById("modalConvertAuthor").textContent = mod.convertAuthor;
                document.getElementById("modalDescription").textContent = mod.description;
                const downloadLink = document.getElementById("modalDownload");
                downloadLink.href = mod.download;
                const imagesDiv = document.getElementById("modalImages");
                imagesDiv.innerHTML = '';
                mod.images.forEach(url => {
                    const img = document.createElement("img");
                    img.src = url;
                    img.onclick = () => window.open(url, "_blank");
                    imagesDiv.appendChild(img);
                });
            }

            closeModal.onclick = () => modal.style.display = 'none';
            window.onclick = e => {
                if (e.target === modal) modal.style.display = 'none';
            };

            // --- Одобрення / Відхилення ---
            document.getElementById("approveBtn").onclick = async () => {
                if (!currentModId) return;
                const snap = await get(ref(db, `modsForApproval/${currentModId}`));
                if (!snap.exists()) return;
                const mod = snap.val();
                const newRef = push(ref(db, 'mods1'));
                await set(newRef, mod);
                await remove(ref(db, `modsForApproval/${currentModId}`));
                modal.style.display = 'none';
                loadModsForApproval();
            };
            document.getElementById("rejectBtn").onclick = async () => {
                if (!currentModId) return;
                await remove(ref(db, `modsForApproval/${currentModId}`));
                modal.style.display = 'none';
                loadModsForApproval();
            };

            // --- Users ---
            async function loadUsers() {
                usersTableBody.innerHTML = '';
                const snap = await get(ref(db, 'users'));
                if (snap.exists()) {
                    const users = snap.val();
                    Object.entries(users).forEach(([uid, u]) => {
                        const tr = document.createElement('tr');
                        const regDate = u.createdAt ? new Date(u.createdAt).toLocaleString('uk-UA') : '';
                        tr.innerHTML = `
                <td>${u.displayName||''}</td>
                <td>${u.email||''}</td>
                <td>${regDate}</td>
                <td>${u.role||'user'}</td>
                <td>
                    <button class="btn btn-primary" id="premiumBtn-${uid}">${u.isPremium?'Забрать премиум':'Премиум'}</button>
                    <button class="btn btn-primary" id="adminBtn-${uid}">${u.isAdmin?'Снять админку':'Админ'}</button>
                    <button class="btn btn-logout" id="banBtn-${uid}">${u.isBanned?'Разблокировать':'Заблокировать'}</button>
                </td>`;
                        usersTableBody.appendChild(tr);

                        document.getElementById(`premiumBtn-${uid}`).onclick = async () => {
                            await update(ref(db, `users/${uid}`), {
                                isPremium: !u.isPremium
                            });
                            u.isPremium = !u.isPremium;
                            document.getElementById(`premiumBtn-${uid}`).textContent = u.isPremium ? 'Забрать премиум' : 'Премиум';
                        }
                        document.getElementById(`adminBtn-${uid}`).onclick = async () => {
                            await update(ref(db, `users/${uid}`), {
                                isAdmin: !u.isAdmin
                            });
                            u.isAdmin = !u.isAdmin;
                            document.getElementById(`adminBtn-${uid}`).textContent = u.isAdmin ? 'Снять админку' : 'Админ';
                        }
                        document.getElementById(`banBtn-${uid}`).onclick = async () => {
                            await update(ref(db, `users/${uid}`), {
                                isBanned: !u.isBanned
                            });
                            u.isBanned = !u.isBanned;
                            document.getElementById(`banBtn-${uid}`).textContent = u.isBanned ? 'Разблокировать' : 'Заблокировать';
                        }
                    });
                } else {
                    usersTableBody.innerHTML = '<tr><td colspan="5"><i>Нет пользователей</i></td></tr>';
                }
            }