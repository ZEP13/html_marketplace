function showChat(user) {
  document.getElementById("chat-container").style.display = "block";
  document.getElementById("chat-header").innerText = "Chat avec " + user;
  document.getElementById("chat-headerText").innerText = user;
  // Masquer la liste des contacts sur les petits écrans
  if (window.innerWidth <= 767) {
    document.querySelector(".contact-list-container").style.display = "none";
  }
}

// Fonction pour revenir à la liste des contacts
function showContacts() {
  document.getElementById("chat-container").style.display = "none";
  // Afficher à nouveau la liste des contacts sur les petits écrans
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

document.activeElement("DOMContentLoaded", function () {
  let userId;
});
