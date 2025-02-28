document.addEventListener("DOMContentLoaded", function () {
  fetch(`../public/index.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // Affichez la réponse brute pour diagnostiquer le problème
      return response.text(); // Récupérez d'abord la réponse en texte
    })
    .then((text) => {
      try {
        const data = JSON.parse(text); // Essayez de convertir le texte en JSON
        console.log("Données reçues :", data);

        if (data.error) {
          console.error(data.error);
          return;
        }

        const container = document.querySelector(".card-container");

        data.forEach((produit) => {
          const cardCol = document.createElement("div");
          cardCol.className = "col-md-4 mb-4";

          const card = document.createElement("div");
          card.className = "product-card card";

          const img = document.createElement("img");
          img.className = "card-img-top";
          img.src = produit.image || ""; // Assurez-vous que produit.img est défini, sinon mettez une image par défaut
          img.alt = produit.title || "Image produit";
          img.width = "100";

          const cardBody = document.createElement("div");
          cardBody.className = "card-body";

          const title = document.createElement("h5");
          title.className = "card-title";
          title.textContent = produit.title;

          const row = document.createElement("div");
          row.className = "col";

          const priceCol = document.createElement("div");
          priceCol.className = "col-md-6";
          const priceText = document.createElement("p");
          priceText.className = "card-text";
          priceText.innerHTML = `<strong>Prix: </strong>${produit.price} €`;

          const descriptionCol = document.createElement("div");
          descriptionCol.className = "col-md-6";
          const descriptionText = document.createElement("p");
          descriptionText.className = "card-text";
          descriptionText.textContent = produit.description;

          // Ajoutez les éléments à la structure
          row.appendChild(priceCol);
          row.appendChild(descriptionCol);

          priceCol.appendChild(priceText);
          descriptionCol.appendChild(descriptionText);

          cardBody.appendChild(title);
          cardBody.appendChild(row);

          const btnContainer = document.createElement("div");
          btnContainer.className = "btn-container";

          const heartButton = document.createElement("a");
          heartButton.href = `./detail_product.php?id=${produit.id}`;
          heartButton.className = "btn btn-primary";
          const heartIcon = document.createElement("i");
          heartIcon.className = "fas fa-heart";
          heartButton.appendChild(heartIcon);

          const cartButton = document.createElement("a");
          cartButton.href = `./detail_product.php?id=${produit.id}`;
          cartButton.className = "btn btn-secondary";
          const cartIcon = document.createElement("i");
          cartIcon.className = "fas fa-cart-plus";
          cartButton.appendChild(cartIcon);

          btnContainer.appendChild(heartButton);
          btnContainer.appendChild(cartButton);

          card.appendChild(img);
          card.appendChild(cardBody);
          card.appendChild(btnContainer);

          cardCol.appendChild(card);
          container.appendChild(cardCol);
        });
      } catch (error) {
        console.error("Erreur de parsing JSON :", error);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });
});
