document.addEventListener("DOMContentLoaded", function (event) {
  event.preventDefault();
  const produitId = 1; // ID du produit que vous voulez récupérer

  fetch(`../public/index.php?id=${produitId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((reponse) => reponse.json())
    .then((data) => {
      if (data && data.length > 0) {
        const produit = data[0];

        console.log(produit);

        const imageSrc = produit.image
          ? produit.image
          : "../img/imgProduct/default.jpg";
        document.getElementById("imgProduit").src = imageSrc;

        document.getElementById("titleProduit").textContent = produit.title;

        document.getElementById("descriptionProduit").textContent =
          produit.description;
        document.getElementById("prixProduit").textContent = produit.price;
        document.getElementById("nomVendeur").textContent =
          produit.user_nom + " " + produit.user_prenom;
      } else {
        console.error("Produit non trouvé ou données vides.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });

  fetch(`../public/index.php?id=${produitId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((reponse) => reponse.json())
    .then((dataReview) => {
      if (dataReview && dataReview.length > 0) {
        console.log(dataReview);

        const cardReview = document.getElementById("cardReview");

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
                  <strong>${review.id_user}</strong>
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
        console.error("Aucune review pour ce produit.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });
});
