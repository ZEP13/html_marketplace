let userId; // Variable globale pour stocker l'ID utilisateur

document.addEventListener("DOMContentLoaded", function () {
  const alertContainer = document.getElementById("alertContainerProfil");

  // Vérifier la session et récupérer les données de l'utilisateur
  fetch("../public/index.php?api=user&action=getUser", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse du serveur:", data);

      if (data.id) {
        userId = data.id;

        // Vérifier si l'utilisateur est admin et afficher le bouton si c'est le cas
        if (data.role === "Admin") {
          const adminButton = document.getElementById("adminButton");
          if (adminButton) {
            adminButton.style.display = "block";
          }
        }

        // Mettre à jour le profil avec les données de l'utilisateur
        const imageSrc = data.img
          ? data.img
          : "../img/imgUserProfil/defaultPP.png";

        document.getElementById("imgPhotoProfil").src = imageSrc;
        document.getElementById("usernameprofil").textContent =
          data.nom + " " + data.prenom;
        document.getElementById("usermailprofil").textContent = data.mail;
        document.getElementById("emailInputEditModal").value = data.mail;
      } else {
        console.error("Aucune session active");
        // Rediriger l'utilisateur vers la page de connexion s'il n'est pas connecté
        window.location.href = "../views/login.html";
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la vérification de la session:", error);
    });

  // Fonction pour modifier l'email
  document
    .getElementById("formEditModalMail")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const dataEditMail = {
        action: "editMail",
        mail: document.getElementById("usermailprofil").textContent,
        newMail: document.getElementById("emailInputEditModal").value,
        id: userId, // Utiliser l'ID utilisateur stocké dans la variable globale
      };
      console.log(dataEditMail);
      fetch("../public/index.php?api=user&action=editMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataEditMail),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Réponse du serveur:", data);

          if (data.success) {
            alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            document.getElementById("usermailprofil").textContent =
              dataEditMail.newMail;
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch((error) => {
          alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la requête: ${error.message}</div>`;
          console.error("Erreur lors de la requête:", error);
        });
    });

  // Attacher cette fonction au bouton de déconnexion après le chargement du DOM
  document.getElementById("deconnection").addEventListener("click", logout);

  // Fonction pour mettre à jour l'image de profil
  document
    .getElementById("formImgProfil")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const imgInput = document.getElementById("imgInput");
      const formData = new FormData();

      // Ajouter l'image et l'action à FormData
      formData.append("profileImage", imgInput.files[0]);
      formData.append("action", "addImgProfil");

      // Envoi de la photo via fetch
      fetch("../public/index.php?api=user&action=addImgProfil", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Mettre à jour l'image de profil
            document.getElementById("imgPhotoProfil").src =
              data.newProfileImageUrl;
            alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch((error) => {
          console.error("Erreur:", error);
        });
    });

  // Déplacer la fonction logout à l'intérieur du DOMContentLoaded pour avoir accès à alertContainer
  function logout() {
    fetch("../public/index.php?api=user&action=logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "../views/login.html";
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">Échec de la déconnexion</div>`;
        }
      })
      .catch((error) => {
        console.error("Erreur de déconnexion:", error);
        alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la déconnexion</div>`;
      });
  }

  // Attacher l'événement de déconnexion
  document.getElementById("deconnection").addEventListener("click", logout);
});
