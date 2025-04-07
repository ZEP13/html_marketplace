document.addEventListener("DOMContentLoaded", function () {
  let currentContactId = null; // Variable globale pour stocker l'ID du destinataire

  // Affichage des contacts
  fetch("../public/index.php?api=message&action=getContacts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const contact = document.getElementById("userContact");

      let htmlContent = "";

      data.contacts.forEach((nom) => {
        htmlContent += `
          <li data-contact-id="${nom.contact_id}" class="contact-item">${nom.user_nom} ${nom.user_prenom}</li>
        `;
      });

      contact.innerHTML = htmlContent;

      // Ajouter un gestionnaire d'événements pour chaque contact
      const contactItems = document.querySelectorAll(".contact-item");
      contactItems.forEach((item) => {
        item.addEventListener("click", function () {
          currentContactId = item.getAttribute("data-contact-id"); // Enregistrer l'ID du contact sélectionné
          const userPrenom = item.innerText.split(" ")[1]; // Extraction du prénom
          const userNom = item.innerText.split(" ")[0]; // Extraction du nom
          showChat(currentContactId, userPrenom, userNom); // Appeler la fonction showChat avec les paramètres
        });
      });

      console.log("contacts: ", data); // Affichage des contacts récupérés
    });

  // Fonction pour afficher le chat avec les messages
  function showChat(contact_id, user_prenom, user_nom) {
    // Vider la zone des messages avant de charger les nouveaux messages
    const chatZone = document.getElementById("zoneMessage");
    chatZone.innerHTML = ""; // Effacer les messages précédents

    // Récupérer les messages du contact sélectionné
    fetch(
      `../public/index.php?api=message&action=getMessages&id_receiver=${contact_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // Afficher la section de chat
        document.getElementById("chat-container").style.display = "block";
        document.getElementById(
          "chat-header"
        ).innerText = `Chat avec ${user_prenom} ${user_nom}`;
        document.getElementById("chat-headerText").innerText = user_prenom;

        // Masquer la liste des contacts si on est sur mobile
        if (window.innerWidth <= 767) {
          document.querySelector(".contact-list-container").style.display =
            "none";
        }

        let htmlContent = "";

        // Affichage des messages récupérés
        data.messages.forEach((message) => {
          htmlContent += `
            <div class="message">
              <p><strong>${message.sender_prenom}:</strong> ${
            message.message
          }</p>
              <small>${new Date(
                message.created_at
              ).toLocaleString()}</small> <!-- Date du message -->
            </div>
          `;
        });

        chatZone.innerHTML = htmlContent; // Affichage des messages dans la zone de chat
        console.log("messages: ", data.messages); // Affichage des messages récupérés
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des messages:", error);
      });
  }

  // Fonction pour revenir à la liste des contacts
  function showContacts() {
    document.getElementById("chat-container").style.display = "none";
    // Afficher la liste des contacts sur les petits écrans
    if (window.innerWidth <= 767) {
      document.querySelector(".contact-list-container").style.display = "block";
    }
  }

  // Ajuster l'affichage en fonction de la taille de l'écran
  window.addEventListener("resize", function () {
    if (window.innerWidth > 767) {
      document.querySelector(".contact-list-container").style.display = "block";
      document.querySelector(".chat-container").style.display = "block";
    } else if (window.innerWidth <= 767) {
      if (document.getElementById("chat-container").style.display === "block") {
        document.querySelector(".contact-list-container").style.display =
          "none";
      }
    }
  });

  // Soumission du formulaire pour envoyer un message
  document
    .getElementById("messageForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      if (!currentContactId) {
        alert("Veuillez sélectionner un contact avant d'envoyer un message.");
        return;
      }

      const message = document.getElementById("messageValue").value;
      console.log(message);
      if (typeof message !== "string" || message.trim() === "") {
        console.log("c pas un string");
      }
      fetch("../public/index.php?api=message&action=sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: currentContactId, // Utilisation de l'ID du destinataire
          message: document.getElementById("messageValue").value,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const alertContainer = document.getElementById(
            "alertContainerMessage"
          );
          if (data.success) {
            alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          } else {
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch((error) => {
          const alertContainer = document.getElementById(
            "alertContainerMessage"
          );
          if (alertContainer) {
            alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de la requête: ${error.message}</div>`;
          }

          console.error("Erreur lors de la requête:", error);
        });
    });
});
