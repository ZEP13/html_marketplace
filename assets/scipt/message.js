let sessionId;
let currentContactId = null;
let isChatBanned = false;
let isReceiverBanned = false; // Statut destinataire
let pollingIntervalId = null; // <-- Ajouté pour gérer le polling auto

function goBack() {
  const previousPage = document.referrer;
  if (previousPage.includes("detail_produit.html")) {
    window.history.back();
  } else {
    window.location.href = "./user.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=user&action=checkChatBan")
    .then((res) => res.json())
    .then((data) => {
      if (data.chat_ban) {
        isChatBanned = true;
        handleChatBan();
      } else {
        initializeChat();
      }
    })
    .catch((error) => console.error("Erreur:", error));
});

function handleChatBan() {
  document.getElementById("banMessage").style.display = "block";
  document.querySelector(".contact-list-container").style.display = "none";
  document.querySelector(".chat-container").style.display = "none";
}

function initializeChat() {
  fetch("../public/index.php?api=message&action=getSessionId")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        sessionId = data.id;
        loadContacts();
      }
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération de l'ID de session:", error)
    );

  const urlParams = new URLSearchParams(window.location.search);
  const contactId = urlParams.get("contact_id");

  if (contactId) {
    fetch(`../public/index.php?api=user&action=getUserById&id=${contactId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const contactList = document.getElementById("userContact");
          if (!contactList.querySelector(`[data-contact-id="${contactId}"]`)) {
            const newContactHtml = `
              <li data-contact-id="${contactId}" class="contact-item">
                ${data.user.nom} ${data.user.prenom}
              </li>`;
            contactList.insertAdjacentHTML("afterbegin", newContactHtml);
            addClickListenerToContact(
              contactList.querySelector(`[data-contact-id="${contactId}"]`)
            );
          }
          showChat(contactId, data.user.prenom, data.user.nom);
        }
      })
      .catch((error) => console.error("Erreur:", error));
  }
}

function loadContacts() {
  if (isChatBanned) return;

  fetch("../public/index.php?api=message&action=getContacts")
    .then((res) => res.json())
    .then((data) => {
      const contactList = document.getElementById("userContact");
      if (!data.contacts || data.contacts.length === 0) {
        contactList.innerHTML = "<li>Aucun contact disponible</li>";
        return;
      }

      contactList.innerHTML = data.contacts
        .map(
          (c) => `
          <li data-contact-id="${c.contact_id}" class="contact-item">
            ${c.user_nom} ${c.user_prenom}
          </li>`
        )
        .join("");

      document
        .querySelectorAll(".contact-item")
        .forEach(addClickListenerToContact);
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des contacts:", error)
    );
}

function addClickListenerToContact(item) {
  item.addEventListener("click", () => {
    currentContactId = item.getAttribute("data-contact-id");
    const [userNom, userPrenom] = item.innerText.split(" ");
    showChat(currentContactId, userPrenom, userNom);
  });
}

function showChat(contact_id, user_prenom, user_nom) {
  if (isChatBanned) {
    displayErrorMessage(
      "Vous êtes banni du chat et ne pouvez pas envoyer de messages."
    );
    return;
  }

  fetch(`../public/index.php?api=user&action=checkChatBan&userId=${contact_id}`)
    .then((res) => res.json())
    .then((data) => {
      isReceiverBanned = data.chat_ban;

      displayBasicInfo(contact_id, user_prenom, user_nom);

      if (isReceiverBanned) {
        displayErrorMessage(
          "Cet utilisateur est banni du chat. Vous ne pouvez pas communiquer avec lui pour le moment."
        );
      } else {
        displayChatMessages(contact_id);
      }
    })
    .catch((error) => {
      console.error("Erreur statut destinataire:", error);
      displayBasicInfo(contact_id, user_prenom, user_nom);
      displayChatMessages(contact_id);
    });
}

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

function displayChatMessages(contact_id) {
  const chatZone = document.getElementById("zoneMessage");
  chatZone.style.scrollBehavior = "auto";
  chatZone.innerHTML = showLoadingState();
  document.getElementById("messageForm").style.display = "block";

  function fetchMessages() {
    fetch(
      `../public/index.php?api=message&action=getMessages&id_receiver=${contact_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        const messages = data.messages || [];
        if (messages.length === 0) {
          chatZone.innerHTML = `<div class="no-messages"><p>Commencez la conversation !</p></div>`;
        } else {
          chatZone.innerHTML = messages
            .map((message) => {
              const isMyMessage = message.sender_id === sessionId;
              return `
                <div class="message ${isMyMessage ? "sent" : "received"}">
                  <p>${message.message}</p>
                  <small>${parseDateAsUTC(
                    message.created_at
                  ).toLocaleString()}</small>
                </div>`;
            })
            .join("");
          chatZone.scrollTop = chatZone.scrollHeight;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des messages:", error);
        chatZone.innerHTML = `
          <div class="no-messages">
            <img src="../assets/images/no-messages.svg" alt="Pas de messages">
            <p>Commencez la conversation !</p>
          </div>`;
      });
  }
  function parseDateAsUTC(dateString) {
    return new Date(dateString.replace(" ", "T") + "Z");
  }

  // Charger immédiatement
  fetchMessages();

  // Nettoyer ancien intervalle si existant
  if (pollingIntervalId) clearInterval(pollingIntervalId);

  // Démarrer un nouvel intervalle
  pollingIntervalId = setInterval(() => {
    if (currentContactId === contact_id) {
      fetchMessages();
    } else {
      clearInterval(pollingIntervalId);
    }
  }, 5000);
}

function showContacts() {
  document.getElementById("chat-container").style.display = "none";
  if (window.innerWidth <= 767) {
    document.querySelector(".contact-list-container").style.display = "block";
  }
}

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
    const messageText = messageInput.value.trim();
    if (messageText === "") return;

    const chatZone = document.getElementById("zoneMessage");
    const newMessage = `
    <div class="message sent">
      <p>${messageText}</p>
      <small>${new Date().toLocaleString()}</small>
    </div>`;
    chatZone.insertAdjacentHTML("beforeend", newMessage);
    chatZone.scrollTop = chatZone.scrollHeight;

    messageInput.value = "";

    fetch("../public/index.php?api=message&action=sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiver: currentContactId,
        messages: messageText,
      }),
    })
      .then((res) => res.json())
      .catch((error) =>
        console.error("Erreur lors de l'envoi du message:", error)
      );
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
