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
});
