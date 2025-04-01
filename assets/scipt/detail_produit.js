document.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const produitId = urlParams.get("id"); // Récupère l'ID correctement depuis l'URL

  fetch(
    `../public/index.php?api=produit&action=getProduitsById&id=${produitId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((reponse) => reponse.json())
    .then((data) => {
      if (data.produit && data.produit.length > 0) {
        const produit = data.produit[0];

        console.log(produit);

        const imageSrc = produit.image
          ? produit.image
          : "../img/imgProduct/default.jpg";
        document.getElementById("imgProduit").src = imageSrc;
        document.getElementById("imgProduitModal").src = imageSrc;

        document.getElementById("titleProduit").textContent = produit.title;

        document.getElementById("descriptionProduit").textContent =
          produit.description;
        document.getElementById("prixProduit").textContent = produit.price;
        document.getElementById("prixProduit2").textContent = produit.price;
        document.getElementById("nomVendeur").textContent =
          produit.user_nom + " " + produit.user_prenom;
        // Stocker l'ID du vendeur dans un attribut data
        document
          .getElementById("link_vend")
          .setAttribute("data-vendeur-id", produit.id_user);
      } else {
        console.log(data);
        console.error("Produit non trouvé ou données vides.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });

  fetch(`../public/index.php?api=review&id=${produitId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((reponse) => reponse.json())
    .then((dataReview) => {
      const cardReview = document.getElementById("cardReview");

      if (dataReview && dataReview.length > 0) {
        console.log(dataReview);
        const reviewCount = dataReview.length;
        document.getElementById("reviewCount").textContent =
          "(" + reviewCount + " avis)";
        // Parcourir les reviews et les afficher
        dataReview.forEach((review) => {
          const reviewCard = document.createElement("div");
          // Générer les étoiles en fonction de la note
          const maxStars = 5;
          const filledStars = "★".repeat(review.rating); // Étoiles pleines
          const emptyStars = "☆".repeat(maxStars - review.rating); // Étoiles vides
          const starRating = filledStars + emptyStars;

          reviewCard.innerHTML = `
            <div class="card-body">
              <div class="d-flex">
                <div class="me-3">
                  <strong>${review.user_nom + " " + review.user_prenom}</strong>
                  <div class="text-warning">
                    ${starRating} <!-- Affichage des étoiles -->
                  </div>
                </div>
                <p class="card-text">
                  ${review.commentaire}
                </p>
              </div>
            </div>
          `;
          cardReview.appendChild(reviewCard);
        });
      } else {
        cardReview.innerHTML = `
          <div class="card-body">
            <div class="d-flex">
              <div class="me-3">
                <strong>Aucune review pour ce produit.</strong>
              </div>
            </div>
          </div>
        `;
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });

  // Ajout de l'event listener pour le panier
  const addPanierBtn = document.getElementById("ajoutePanier");

  addPanierBtn.addEventListener("click", function (event) {
    event.preventDefault();
    const alertContainer = document.querySelector(".alertContainerDetail");
    const quantite = document.getElementById("quantity").value;

    fetch("../public/index.php?api=panier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "addPanier",
        id_produit: produitId,
        quantite: quantite,
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
});

function contactVendeur() {
  const vendeurId = document
    .getElementById("link_vend")
    .getAttribute("data-vendeur-id");
  if (vendeurId) {
    document.location.href = `../views/chat.html?id=${vendeurId}`;
  } else {
    console.error("ID du vendeur non trouvé");
  }
}
