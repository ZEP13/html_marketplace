document.addEventListener("DOMContentLoaded", function () {
  fetch(`../public/index.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
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
          cardCol.className = "col-12 col-md-4 pb-3";
          const card = document.createElement("div");
          card.className = "product-card card";

          const img = document.createElement("img");
          img.className = "card-img-top";
          img.src = produit.image || "../img/imgProduct/default.jpg";
          img.alt = produit.title || "Image produit";
          img.width = "70";

          const cardBody = document.createElement("div");
          cardBody.className = "card-body";

          const title = document.createElement("h5");
          title.className = "card-title";
          title.textContent = produit.title;

          const row = document.createElement("div");
          row.className = "col";

          const priceCol = document.createElement("div");
          priceCol.className = "col-md-12 pb-2";
          const priceText = document.createElement("p");
          priceText.className = "card-text";
          priceText.innerHTML = `<strong>Prix: </strong>${produit.price} €`;

          const descriptionCol = document.createElement("div");
          descriptionCol.className = "col-md-12";
          const descriptionText = document.createElement("p");
          descriptionText.className = "card-text";
          descriptionText.textContent = produit.description;

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
          cartButton.href = "#";
          cartButton.className = "btn btn-secondary panier";
          cartButton.id = "panier";
          const cartIcon = document.createElement("i");
          cartIcon.className = "fas fa-cart-plus";
          cartButton.appendChild(cartIcon);
          const alertContainer = document.getElementById(
            "alertContainerfilproduit"
          );
          if (cartButton) {
            cartButton.addEventListener("click", function (event) {
              event.preventDefault();

              // Récupérer l'ID du produit spécifique pour cet élément
              const produitId = produit.id_produit; // Utiliser l'id_produit de l'élément actuel

              // Appel de la fonction d'ajout au panier
              fetch("../public/index.php", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "addPanier",
                  id_produit: produitId, // Utiliser l'id du produit spécifique
                  quantite: 1,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                  } else {
                    alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                  }
                })
                .catch((error) => {
                  console.error("Erreur lors de l'ajout au panier :", error);
                });
            });
          } else {
            console.error("L'élément  n'a pas été trouvé.");
          }

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
