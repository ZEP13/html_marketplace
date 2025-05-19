document.addEventListener("DOMContentLoaded", function () {
  const validateCartBtn = document.getElementById("validate-cart-btn");
  const messageDiv = document.getElementById("message");
  const total = document.getElementById("total");

  // Récupérer le total du panier
  fetch("../public/index.php?api=panier")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.panier) {
        // Calculer le total
        let totalAmount = 0;
        let fraisPort = 0;

        // Calculer le sous-total
        totalAmount = data.panier.reduce((sum, product) => {
          return sum + product.price * product.quantite_panier;
        }, 0);

        // Appliquer les frais de port si le total est inférieur à 80€
        if (totalAmount < 80) {
          fraisPort = 5;
        }

        // Vérifier s'il y a une réduction active
        const activePromoId = localStorage.getItem("activePromoId");
        if (activePromoId) {
          fetch(`../public/index.php?api=promo&action=getPromo`)
            .then((response) => response.json())
            .then((promoData) => {
              const promo = promoData.promos.find(
                (p) => p.id === Number(activePromoId)
              );
              if (promo) {
                let reduction = 0;
                if (promo.type_reduction === "pourcentage") {
                  reduction = totalAmount * (promo.reduction_value / 100);
                  if (promo.montant_max && reduction > promo.montant_max) {
                    reduction = Number(promo.montant_max);
                  }
                } else {
                  reduction = Number(promo.reduction_value);
                }
                totalAmount = totalAmount - reduction;
              }
              // Afficher le total final avec les frais de port
              total.textContent = (totalAmount + fraisPort).toFixed(2);
            });
        } else {
          // Afficher le total sans réduction avec les frais de port
          total.textContent = (totalAmount + fraisPort).toFixed(2);
        }
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du total:", error);
      total.textContent = "0.00";
    });

  function handleValidation() {
    messageDiv.innerHTML =
      "<div class='alert alert-info'>Traitement de votre commande...</div>";

    // Get the promo ID from localStorage
    const activePromoId = localStorage.getItem("activePromoId");

    // Convert to number or null
    const promoId = activePromoId ? Number(activePromoId) : null;

    console.log("Using promo ID:", promoId);

    // Étape 1: Créer la commande avec l'ID de la promo
    fetch("../public/index.php?api=commande", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "addCommande",
        promo_id: promoId, // Send as null if no promo
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

        // Clear promo data after successful order
        localStorage.removeItem("activePromoId");

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
        console.error("Error:", error);
        messageDiv.innerHTML = `<div class='alert alert-danger'>Erreur: ${error.message}</div>`;
      });
  }

  validateCartBtn.addEventListener("click", handleValidation);
});
