// js pour login style
const container = document.querySelector(".auth-container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

function togglePassword(passwordId, iconId) {
  var passwordField = document.getElementById(passwordId);
  var showPasswordIcon = document.getElementById(iconId);

  // Si le type est "password", changer en "text", sinon en "password"
  if (passwordField.type === "password") {
    passwordField.type = "text";
    showPasswordIcon.classList.remove("bxs-lock-alt");
    showPasswordIcon.classList.add("bxs-lock-open-alt");
  } else {
    passwordField.type = "password";
    showPasswordIcon.classList.remove("bxs-lock-open-alt");
    showPasswordIcon.classList.add("bxs-lock-alt");
  }
}

//create a new user
document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const alertContainerREGISTER = document.getElementById(
      "alertContainerREGISTER"
    );
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (confirmPassword !== document.getElementById("registerPassword").value) {
      alertContainerREGISTER.innerHTML = `<div class="alert alert-danger">Les mots de passe ne correspondent pas</div>`;
      return;
    }

    const dataForm = {
      nom: document.getElementById("Nom").value,
      prenom: document.getElementById("Prenom").value,
      mail: document.getElementById("registermail").value,
      password: document.getElementById("registerPassword").value,
    };
    console.log(dataForm);
    fetch("../public/index.php?api=user&action=register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataForm),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Réponse du serveur:", data);
        if (data.success) {
          alertContainerREGISTER.innerHTML = `<div class="alert alert-success">${data.message}</div>`;

          // Faire un login automatique avec les données d'inscription
          const loginData = {
            action: "login",
            mail: document.getElementById("registermail").value,
            password: document.getElementById("registerPassword").value,
          };

          // Login automatique après inscription réussie
          fetch("../public/index.php?api=user&action=login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
          })
            .then((response) => response.json())
            .then((loginData) => {
              if (loginData.success) {
                window.location.href = "../views/user.html";
              } else {
                throw new Error("Échec de la connexion automatique");
              }
            });
        } else {
          alertContainerREGISTER.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      })
      .catch((error) => {
        alertContainerREGISTER.innerHTML = `<div class="alert alert-danger">Erreur lors de la requête: ${error.message}</div>`;
        console.error("Erreur lors de la requête:", error);
      });
  });
//login a user

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const rememberMe = document.getElementById("rememberMe").checked;

    const dataFormlog = {
      action: "login",
      mail: document.getElementById("logmail").value,
      password: document.getElementById("loginPassword").value,
      rememberMe: rememberMe,
    };

    fetch("../public/index.php?api=user&action=login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataFormlog),
    })
      .then((response) => response.json())
      .then((data) => {
        const alertContainer = document.getElementById("alertContainerLOG");
        if (data.success) {
          if (rememberMe) {
            // Créer un cookie qui expire dans 30 jours
            const d = new Date();
            d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
            document.cookie = `sessionId=${
              data.sessionId
            };expires=${d.toUTCString()};path=/`;
          }
          alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          window.location.href = "../views/user.html";
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      })
      .catch((error) => {
        const alertContainer = document.getElementById("alertContainerLOG");
        alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la requête: ${error.message}</div>`;
        console.error("Erreur lors de la requête:", error);
      });
  });
