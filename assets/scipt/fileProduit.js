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

      const container = document.querySelector(".card-container");
      data.forEach((produit) => {
        const card = document.createElement("div");
        card.className = "card mb-4";
        card.innerHTML = `
          <img src="${produit.image}" class="card-img-top" alt="${produit.title}">
          <div class="card-body">
            <h5 class="card-title">${produit.title}</h5>
            <p class="card-text">${produit.description}</p>
            <p class="card-text"><strong>Prix: </strong>${produit.price} €</p>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });
});
