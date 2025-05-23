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

        const paymentModal = document.getElementById("paymentModal");
        const failureModal = document.getElementById("failureModal");

        // Simuler une probabilité de 90% de succès
        const isSuccess = Math.random() < 0.9;

        paymentModal.style.display = "flex";

        setTimeout(() => {
          if (isSuccess) {
            const paymentStatus = document.getElementById("paymentStatus");
            paymentStatus.innerHTML = `
              <div class="success-step">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
                <h4>Merci pour votre achat !</h4>
                <p>Vous allez être redirigé vers vos commandes...</p>
              </div>
            `;

            setTimeout(() => {
              window.location.href = "user_commande.html";
            }, 5000);
          } else {
            paymentModal.style.display = "none";
            failureModal.style.display = "flex";

            setTimeout(() => {
              window.location.href = "panier.html";
            }, 3000);
          }
        }, 2000);
      })
      .catch((error) => {
        console.error("Error:", error);
        messageDiv.innerHTML = `<div class='alert alert-danger'>Erreur: ${error.message}</div>`;
      });
  }

  validateCartBtn.addEventListener("click", handleValidation);
});
