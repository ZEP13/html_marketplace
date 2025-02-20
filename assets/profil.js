document.addEventListener("DOMContentLoaded", function () {
  let userId; // Variable globale pour stocker l'ID utilisateur

  // Vérifier la session et récupérer les données de l'utilisateur
  fetch("../public/index.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse du serveur:", data);

      if (data.id) {
        userId = data.id; // Stocker l'ID utilisateur dans la variable globale

        // Si la session est active, récupérer les informations de l'utilisateur
        fetch(`../public/index.php?id=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erreur du serveur: " + response.status);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Données reçues :", data);
            if (data.error) {
              console.error(data.error);
              return;
            }

            // Mettre à jour le profil avec les données de l'utilisateur
            document.getElementById("usernameprofil").textContent =
              data.nom + " " + data.prenom;
            document.getElementById("usermailprofil").textContent = data.mail;
            document.getElementById("emailInputEditModal").value = data.mail;
          })
          .catch((error) => {
            console.error("Erreur lors de la requête:", error);
          });
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
        action: "EditMail",
        mail: document.getElementById("usermailprofil").textContent,
        newMail: document.getElementById("emailInputEditModal").value,
        id: userId, // Utiliser l'ID utilisateur stocké dans la variable globale
      };
      console.log(dataEditMail);
      fetch("../public/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataEditMail),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Réponse du serveur:", data); // Affiche la réponse brute du serveur
          const alertContainer = document.getElementById(
            "alertContainerProfil"
          );
          if (data.success) {
            alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            window.location.href = "../views/user.html";
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch((error) => {
          const alertContainer = document.getElementById(
            "alertContainerProfil"
          );
          alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la requête: ${error.message}</div>`;
          console.error("Erreur lors de la requête:", error);
        });
    });
});
