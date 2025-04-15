document.addEventListener("DOMContentLoaded", function () {
  const validateCartBtn = document.getElementById("validate-cart-btn");
  const messageDiv = document.getElementById("message");

  function handleValidation() {
    // Étape 1: Créer la commande
    fetch("../public/index.php?api=commande", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "addCommande",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Étape 2: Mettre à jour le panier avec l'ID de commande
          return fetch("../public/index.php?api=panier", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "validePanier",
              id_commande: data.id_commande,
            }),
          });
        }
        throw new Error("Échec de création de la commande");
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          messageDiv.innerHTML =
            "<div class='alert alert-success'>Commande validée avec succès!</div>";
          setTimeout(() => (window.location.href = "mes_commandes.php"), 2000);
        } else {
          throw new Error("Échec de validation du panier");
        }
      })
      .catch((error) => {
        messageDiv.innerHTML = `<div class='alert alert-danger'>${error.message}</div>`;
      });
  }

  validateCartBtn.addEventListener("click", handleValidation);
});
