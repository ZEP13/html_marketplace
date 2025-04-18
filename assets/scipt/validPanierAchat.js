document.addEventListener("DOMContentLoaded", function () {
  const validateCartBtn = document.getElementById("validate-cart-btn");
  const messageDiv = document.getElementById("message");

  function handleValidation() {
    messageDiv.innerHTML =
      "<div class='alert alert-info'>Traitement de votre commande...</div>";

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
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau");
        return response.json();
      })
      .then((data) => {
        if (!data.success || !data.id_commande) {
          throw new Error(data.message || "Erreur de création de commande");
        }
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
      })
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau");
        return response.json();
      })
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Échec de validation du panier");
        }
        // Étape 3: Utiliser la nouvelle API mail au lieu de l'API commande
        return fetch("../public/index.php?api=mail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "sendOrderConfirmation",
            id_commande: data.id_commande,
          }),
        });
      })
      .then((response) => {
        if (!response.ok) throw new Error("Erreur réseau");
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          messageDiv.innerHTML =
            "<div class='alert alert-success'>Commande validée avec succès! Un email de confirmation vous a été envoyé.</div>";
          setTimeout(() => (window.location.href = "user_commande.html"), 2000);
        } else {
          throw new Error(
            data.message || "Erreur lors de l'envoi de l'email de confirmation"
          );
        }
      })
      .catch((error) => {
        messageDiv.innerHTML = `<div class='alert alert-danger'>${error.message}</div>`;
      });
  }

  validateCartBtn.addEventListener("click", handleValidation);
});
