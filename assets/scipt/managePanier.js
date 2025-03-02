document.addEventListener("DOMContentLoaded", function () {
  const panier = document.getElementById("panier");
  if (panier) {
    panier.addEventListener("click", function (event) {
      event.preventDefault();
      // Appel de la fonction d'ajout au panier
      fetch("../public/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addPanier",
          id_user: id_user,
          id_produit: id_produit,
          quantite: quantite,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Produit ajouté au panier!");
          } else {
            alert("Erreur lors de l'ajout au panier");
          }
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout au panier :", error);
        });
    });
  } else {
    console.error("L'élément  n'a pas été trouvé.");
  }
});
