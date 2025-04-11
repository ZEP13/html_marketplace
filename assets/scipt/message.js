let sessionId;
let currentContactId = null;
let isChatBanned = false;
let isReceiverBanned = false; // Nouvelle variable pour le statut du destinataire

document.addEventListener("DOMContentLoaded", function () {
  // Vérifier d'abord si l'utilisateur est banni
  fetch("../public/index.php?api=user&action=checkChatBan")
    .then((response) => response.json())
    .then((data) => {
      if (data.chat_ban) {
        isChatBanned = true;
        handleChatBan();
      } else {
        // Continuer avec le chargement normal
        initializeChat();
      }
    })
    .catch((error) => console.error("Erreur:", error));
});

function handleChatBan() {
  // Afficher le message de ban
  document.getElementById("banMessage").style.display = "block";

  // Cacher les conteneurs de chat
  document.querySelector(".contact-list-container").style.display = "none";
  document.querySelector(".chat-container").style.display = "none";
}

function initializeChat() {
  // Déplacer le code existant de DOMContentLoaded ici
  fetch("../public/index.php?api=message&action=getSessionId")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        sessionId = data.id;
        loadContacts();
      }
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération de l'ID de session:", error)
    );

  // Vérifier s'il y a un contact_id dans l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const contactId = urlParams.get("contact_id");

  if (contactId) {
    fetch(`../public/index.php?api=user&action=getUserById&id=${contactId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Ajouter le nouveau contact à la liste si nécessaire
          const contact = document.getElementById("userContact");
          const existingContact = contact.querySelector(
            `[data-contact-id="${contactId}"]`
          );

          if (!existingContact) {
            const newContactHtml = `
                            <li data-contact-id="${contactId}" class="contact-item">
                                ${data.user.nom} ${data.user.prenom}
                            </li>
                        `;
            contact.insertAdjacentHTML("afterbegin", newContactHtml);
          }

          showChat(contactId, data.user.prenom, data.user.nom);
        }
      })
      .catch((error) => console.error("Erreur:", error));
  }
}

// Fonction pour charger les contacts
function loadContacts() {
  if (isChatBanned) return;
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

      // Les utilisateurs bannis sont déjà filtrés côté serveur
      data.contacts.forEach((nom) => {
        htmlContent += `
          <li data-contact-id="${nom.contact_id}" class="contact-item">
            ${nom.user_nom} ${nom.user_prenom}
          </li>
        `;
      });

      contact.innerHTML = htmlContent || "<li>Aucun contact disponible</li>";

      // Ajouter les écouteurs d'événements aux contacts
      const contactItems = document.querySelectorAll(".contact-item");
      contactItems.forEach((item) => {
        item.addEventListener("click", function () {
          currentContactId = item.getAttribute("data-contact-id");
          const userPrenom = item.innerText.split(" ")[1];
          const userNom = item.innerText.split(" ")[0];
          showChat(currentContactId, userPrenom, userNom);
        });
      });
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des contacts:", error)
    );
}

// Fonction pour afficher le chat avec les messages
function showChat(contact_id, user_prenom, user_nom) {
  if (isChatBanned) {
    displayErrorMessage(
      "Vous êtes banni du chat et ne pouvez pas envoyer de messages."
    );
    return;
  }

  fetch(`../public/index.php?api=user&action=checkChatBan&userId=${contact_id}`)
    .then((response) => response.json())
    .then((data) => {
      isReceiverBanned = data.chat_ban;
      // Afficher les informations de base même si l'utilisateur est banni
      displayBasicInfo(contact_id, user_prenom, user_nom);

      if (isReceiverBanned) {
        displayErrorMessage(
          "Cet utilisateur est banni du chat. Vous ne pouvez pas communiquer avec lui pour le moment."
        );
      } else {
        displayChatMessages(contact_id);
      }
    });
}

// Nouvelle fonction pour séparer l'affichage du chat
function displayChat(contact_id, user_prenom, user_nom) {
  const chatZone = document.getElementById("zoneMessage");
  const chatcard = document.getElementById("chat-card");
  chatcard.style.visibility = "visible";
  currentContactId = contact_id; // Ajouter cette ligne pour définir le contact actuel

  // Afficher l'en-tête du chat immédiatement
  document.getElementById("chat-container").style.display = "block";
  document.getElementById(
    "chat-header"
  ).innerText = `Chat avec ${user_prenom} ${user_nom}`;
  document.getElementById("chat-headerText").innerText = user_prenom;

  if (window.innerWidth <= 767) {
    document.querySelector(".contact-list-container").style.display = "none";
  }

  // Désactiver l'animation de scroll temporairement
  chatZone.style.scrollBehavior = "auto";
  chatZone.innerHTML = showLoadingState();

  fetch(
    `../public/index.php?api=message&action=getMessages&id_receiver=${contact_id}`
  )
    .then((response) => response.json())
    .then((data) => {
      let htmlContent = "";
      const messages = data.messages || [];

      if (messages.length === 0) {
        chatZone.innerHTML = `
          <div class="no-messages">
            <p>Commencez la conversation !</p>
          </div>
        `;
      } else {
        messages.forEach((message) => {
          const isMyMessage = message.sender_id === sessionId;
          htmlContent += `
            <div class="message ${isMyMessage ? "sent" : "received"}">
              <p>${message.message}</p>
              <small>${new Date(message.created_at).toLocaleString()}</small>
            </div>
          `;
        });
        chatZone.innerHTML = htmlContent;
        chatZone.scrollTop = chatZone.scrollHeight;
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des messages:", error);
      // Afficher quand même l'interface pour permettre d'envoyer le premier message
      chatZone.innerHTML = `
        <div class="no-messages">
          <img src="../assets/images/no-messages.svg" alt="Pas de messages">
          <p>Commencez la conversation !</p>
        </div>
      `;
    });
}

// Nouvelle fonction pour afficher les informations de base
function displayBasicInfo(contact_id, user_prenom, user_nom) {
  const chatcard = document.getElementById("chat-card");
  chatcard.style.visibility = "visible";
  currentContactId = contact_id;

  document.getElementById("chat-container").style.display = "block";
  document.getElementById(
    "chat-header"
  ).innerText = `Chat avec ${user_prenom} ${user_nom}`;
  document.getElementById("chat-headerText").innerText = user_prenom;

  if (window.innerWidth <= 767) {
    document.querySelector(".contact-list-container").style.display = "none";
  }
}

// Nouvelle fonction pour afficher les messages du chat
function displayChatMessages(contact_id) {
  const chatZone = document.getElementById("zoneMessage");
  chatZone.style.scrollBehavior = "auto";
  chatZone.innerHTML = showLoadingState();
  document.getElementById("messageForm").style.display = "block";

  fetch(
    `../public/index.php?api=message&action=getMessages&id_receiver=${contact_id}`
  )
    .then((response) => response.json())
    .then((data) => {
      let htmlContent = "";
      const messages = data.messages || [];

      if (messages.length === 0) {
        chatZone.innerHTML = `
          <div class="no-messages">
            <p>Commencez la conversation !</p>
          </div>
        `;
      } else {
        messages.forEach((message) => {
          const isMyMessage = message.sender_id === sessionId;
          htmlContent += `
            <div class="message ${isMyMessage ? "sent" : "received"}">
              <p>${message.message}</p>
              <small>${new Date(message.created_at).toLocaleString()}</small>
            </div>
          `;
        });
        chatZone.innerHTML = htmlContent;
        chatZone.scrollTop = chatZone.scrollHeight;
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des messages:", error);
      // Afficher quand même l'interface pour permettre d'envoyer le premier message
      chatZone.innerHTML = `
        <div class="no-messages">
          <img src="../assets/images/no-messages.svg" alt="Pas de messages">
          <p>Commencez la conversation !</p>
        </div>
      `;
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
      document.querySelector(".contact-list-container").style.display = "none";
    }
  }
});

// Soumission du formulaire pour envoyer un message
document
  .getElementById("messageForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    if (isChatBanned || isReceiverBanned || !currentContactId) {
      let errorMessage = isChatBanned
        ? "Vous êtes banni du chat et ne pouvez pas envoyer de messages."
        : isReceiverBanned
        ? "Impossible d'envoyer un message à un utilisateur banni."
        : "Veuillez sélectionner un contact avant d'envoyer un message.";

      displayErrorMessage(errorMessage);
      return;
    }

    const messageInput = document.getElementById("messageValue");
    const messageText = messageInput.value;

    // Ajouter le message immédiatement
    const chatZone = document.getElementById("zoneMessage");
    const newMessage = `
        <div class="message sent">
            <p>${messageText}</p>
            <small>${new Date().toLocaleString()}</small>
        </div>
    `;
    chatZone.insertAdjacentHTML("beforeend", newMessage);
    chatZone.scrollTop = chatZone.scrollHeight;

    // Vider l'input immédiatement
    messageInput.value = "";

    // Envoyer le message au serveur
    fetch("../public/index.php?api=message&action=sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiver: currentContactId,
        messages: messageText,
      }),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Erreur lors de l'envoi du message:", error);
      });
  });

function showLoadingState() {
  return `<div class="loading-spinner">
      <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
      </div>
  </div>`;
}

function displayErrorMessage(message) {
  const chatZone = document.getElementById("zoneMessage");
  chatZone.innerHTML = `
    <div class="alert alert-warning text-center">
      <h4>${message}</h4>
    </div>`;
  document.getElementById("messageForm").style.display = "none";
}
