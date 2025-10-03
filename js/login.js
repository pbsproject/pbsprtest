		import { auth, db } from "./js/firebase.js";
		import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
		import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

        const signupContainer = document.getElementById("signupContainer");
        const loginContainer = document.getElementById("loginContainer");

        document.getElementById("showLogin").onclick = () => {
            signupContainer.style.display = "none";
            loginContainer.style.display = "block";
        };
        document.getElementById("showSignup").onclick = () => {
            loginContainer.style.display = "none";
            signupContainer.style.display = "block";
        };

        signupForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("signupEmail").value;
            const password = document.getElementById("signupPassword").value;
            const displayName = document.getElementById("signupName").value;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, {
                    displayName: displayName
                });
                window.location.href = "profile.html";
            } catch (err) {
                alert(err.message);
            }
        });

        loginForm.addEventListener("submit", async e => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "profile.html";
            } catch (err) {
                alert(err.message);
            }
        });