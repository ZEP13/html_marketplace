document.addEventListener("DOMContentLoaded", function () {
  fetch(`../public/index.php`, {
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
      document.getElementById("img").src = data.img;

      // Mettre à jour le profil avec les données de l'utilisateur
      document.getElementById("title").textContent = data.title;
      document.getElementById("Price").textContent = data.prix;
      document.getElementById("Decription").value = data.descritpion;
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });
});
