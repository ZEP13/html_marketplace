document.addEventListener("DOMContentLoaded", function () {
  function showAlert(message, type) {
    const alertContainer = document.getElementById("alertContainer");
    if (alertContainer) {
      alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
    }
  }

  function calculateTotalBeforePromo(productsBySeller) {
    let total = 0;
    // Calculate total for all products
    Object.values(productsBySeller).forEach((products) => {
      products.forEach((product) => {
        total += product.price * product.quantite_panier;
      });
    });
    return total;
  }

  let cartData; // Define a variable to store the cart data

  fetch("../public/index.php?api=panier")
    .then((response) => response.json())
    .then((data) => {
      cartData = data; // Store the fetched data here
      console.log(data);

      let htmlContent = "";
      const panierBox = document.getElementById("panierBox");
      const totalPanier = document.getElementById("total");
      const totalPaye = document.getElementById("totalPaye");
      const fraisPortBox = document.getElementById("fraisPort");
      const fraisPort = 50; // Frais de port standard
      const fraisPortGratuit = 80; // Seuil pour la livraison gratuite

      if (!data.panier || data.panier.length === 0) {
        panierBox.innerHTML = `
          <div class="text-center my-5">
            <h3>Votre panier est vide</h3>
            <p>Découvrez nos produits et commencez vos achats!</p>
          </div>`;
        totalPanier.textContent = "0.00 €";
        fraisPortBox.textContent = "0.00 €";
        totalPaye.textContent = "0.00 €";
        return;
      }

      let total = data.panier.reduce((sum, produit) => {
        return sum + produit.price * produit.quantite_panier;
      }, 0);

      // Générer le contenu du panier
      data.panier.forEach((produit) => {
        htmlContent += `
            <div class="cart-item d-flex justify-content-between align-items-center" data-id="${
              produit.id
            }">
              <div class="d-flex align-items-center">
                <img src="${
                  produit.image || "../img/imgProduct/default.jpg"
                }" alt="Image produit" class="img-fluid me-3" />
                <div>
                  <div class="item-title">${produit.title}</div>
                  <div class="item-price">${produit.price} €</div>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <input type="number" 
                  max="${produit.quantite}" 
                  class="form-control item-quantity" 
                  value="${produit.quantite_panier}" 
                  min="1" 
                  data-id="${produit.id_produit}"
                  data-stock="${produit.quantite}" />
                <span class="remove-btn ms-3" data-id="${
                  produit.id_produit
                }">Supprimer</span>
              </div>
            </div>
          `;
      });

      panierBox.innerHTML = htmlContent;
      totalPanier.textContent = total.toFixed(2) + " €";

      // Vérification des frais de port
      let totalAvecFrais = total;
      if (total >= fraisPortGratuit) {
        totalPaye.textContent = total.toFixed(2) + " €";
      } else {
        fraisPortBox.innerHTML = fraisPort + " €";
        totalAvecFrais += fraisPort;
        totalPaye.textContent = totalAvecFrais.toFixed(2) + " €";
      }

      // Ajouter les event listeners pour la vérification en temps réel
      document.querySelectorAll(".item-quantity").forEach((input) => {
        input.addEventListener("input", function (e) {
          const stock = parseInt(this.getAttribute("data-stock"), 10);
          const value = parseInt(this.value, 10);

          if (value > stock) {
            this.value = stock;
            alertContainer.innerHTML = `
              <div class="alert alert-warning alert-dismissible fade show" role="alert">
                Le stock disponible est limité à ${stock} unités
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
          }

          if (value < 1) {
            this.value = 1;
          }
        });
      });

      setupPanierEventListeners(cartData); // Pass the data to the event handler

      // Initialize promo code handlers
      document
        .getElementById("applyPromoBtn")
        .addEventListener("click", applyPromoCode);
      document
        .getElementById("removePromoBtn")
        ?.addEventListener("click", removePromoCode);
    });

  function setupPanierEventListeners(data) {
    // Gérer la suppression des produits
    document.addEventListener("click", function (e) {
      if (e.target.matches(".remove-btn")) {
        const id_produit = e.target.getAttribute("data-id");

        fetch("../public/index.php?api=panier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete",
            id_produit: id_produit,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              const productRow = e.target.closest(".cart-item");
              productRow.remove(); // Supprimer l'élément du DOM
              alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
              updateTotalPanier();
            } else {
              console.error("Error while deleting the product:", data.message);
              alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
          })
          .catch((error) => {
            console.error("Error while deleting the product:", error);
            alertContainer.innerHTML = `<div class="alert alert-danger">Error deleting the product.</div>`;
          });
      }
    });

    // Gérer le changement de la quantité d'un produit
    document.addEventListener("change", function (e) {
      if (e.target.matches(".item-quantity")) {
        updateQuantity(e.target, data);
      }
    });

    // Ajouter un listener pour l'événement "input" pour mise à jour en direct
    document.addEventListener("input", function (e) {
      if (e.target.matches(".item-quantity")) {
        const value = parseInt(e.target.value, 10);
        const stock = parseInt(e.target.getAttribute("data-stock"), 10);

        // Vérifier si la valeur est valide
        if (!isNaN(value) && value >= 1 && value <= stock) {
          updateQuantity(e.target, data);
        }
      }
    });
  }

  // Nouvelle fonction pour mettre à jour la quantité
  function updateQuantity(quantityInput, data) {
    const id_produit = quantityInput.getAttribute("data-id");
    const newQuantity = parseInt(quantityInput.value, 10);

    // Trouver le produit correspondant
    const produit = data.panier.find((p) => p.id_produit == id_produit);
    const quantiteStock = produit ? produit.quantite : 0;

    if (newQuantity < 1 || isNaN(newQuantity)) {
      showAlert("Quantité invalide", "danger");
      return;
    }

    if (newQuantity > quantiteStock) {
      showAlert(`Stock disponible: ${quantiteStock}`, "warning");
      quantityInput.value = quantiteStock;
      return;
    }

    fetch("../public/index.php?api=panier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "addPanier",
        id_produit: id_produit,
        quantite: newQuantity,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.success) {
          // Mettre à jour cartData avec les nouvelles données
          data.panier = data.panier.map((item) => {
            if (item.id_produit == id_produit) {
              return { ...item, quantite_panier: newQuantity };
            }
            return item;
          });

          // Mettre à jour l'affichage
          const productsBySeller = groupProductsByVendor(data.panier);
          const totalBeforePromo = calculateTotalBeforePromo(productsBySeller);

          // Récupérer le code promo actif s'il existe
          const appliedPromoCode =
            document.getElementById("appliedPromoCode").value;
          if (appliedPromoCode) {
            calculateTotalWithPromo(
              totalBeforePromo,
              productsBySeller,
              appliedPromoCode
            );
          } else {
            updateTotalDisplay(totalBeforePromo, 0);
          }
        } else {
          showAlert(responseData.message || "Erreur de mise à jour", "danger");
        }
      })
      .catch((error) => {
        console.error("Error updating quantity:", error);
        showAlert("Erreur lors de la mise à jour", "danger");
      });
  }

  // Ajouter une fonction helper pour grouper les produits par vendeur
  function groupProductsByVendor(products) {
    return products.reduce((acc, product) => {
      if (!acc[product.user_id]) {
        acc[product.user_id] = [];
      }
      acc[product.user_id].push(product);
      return acc;
    }, {});
  }

  // Modifier updateTotalPanier pour gérer les sous-totaux par vendeur
  function updateTotalPanier() {
    fetch("../public/index.php?api=panier")
      .then((response) => response.json())
      .then((data) => {
        if (!data.panier || data.panier.length === 0) {
          handleEmptyCart();
          return;
        }

        const productsBySeller = groupProductsByVendor(data.panier);
        let totalBeforePromo = calculateTotalBeforePromo(productsBySeller);

        // Appliquer le code promo si présent
        const appliedPromoCode =
          document.getElementById("appliedPromoCode").value;
        if (appliedPromoCode) {
          calculateTotalWithPromo(
            totalBeforePromo,
            productsBySeller,
            appliedPromoCode
          );
        } else {
          updateTotalDisplay(totalBeforePromo, 0);
        }
      })
      .catch((error) => {
        console.error("Error updating cart:", error);
        showAlert("Erreur lors de la mise à jour du panier", "danger");
      });
  }

  // Remplacer la fonction applyPromoCode actuelle par celle-ci
  function applyPromoCode() {
    const promoCode = document.getElementById("promoCodeInput").value.trim();

    if (!promoCode) {
      showAlert("Veuillez entrer un code promo", "warning");
      return;
    }

    fetch(`../public/index.php?api=promo&action=getPromo`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Réponse API complète:", data);

        if (!data.promos || !Array.isArray(data.promos)) {
          console.error("Format de réponse invalide:", data);
          showAlert("Erreur lors de la récupération des promos", "danger");
          return;
        }

        // Recherche du code promo (insensible à la casse)
        const promo = data.promos.find(
          (p) => p.code.toLowerCase() === promoCode.toLowerCase()
        );

        console.log("Code recherché:", promoCode);
        console.log("Promo trouvée:", promo);

        if (!promo) {
          showAlert("Code promo invalide", "warning");
          return;
        }

        // Vérifier si c'est une promo vendeur
        if (Number(promo.ajoute_par_admin) !== 1) {
          const vendeurId = Number(promo.vendeur_id);

          // Vérifier les produits du vendeur dans le panier
          const vendeurProducts = cartData.panier.filter((product) => {
            const productVendeurId = Number(product.user_id);
            console.log("Comparaison:", {
              productId: product.id_produit,
              productVendeurId,
              vendeurId,
              match: productVendeurId === vendeurId,
            });
            return productVendeurId === vendeurId;
          });

          if (vendeurProducts.length === 0) {
            showAlert(
              "Aucun produit de ce vendeur dans votre panier",
              "warning"
            );
            return;
          }

          // Calculer le total des produits du vendeur
          const vendeurTotal = vendeurProducts.reduce(
            (sum, product) =>
              sum + Number(product.price) * Number(product.quantite_panier),
            0
          );

          if (
            promo.condition_min &&
            vendeurTotal < Number(promo.condition_min)
          ) {
            showAlert(
              `Montant minimum de ${promo.condition_min}€ requis pour ce code promo`,
              "warning"
            );
            return;
          }

          const reduction = calculatePromoReduction(vendeurTotal, promo);
          applyPromoToDisplay(promoCode, promo, reduction);
          updateTotalDisplay(
            calculateTotalBeforePromo(groupProductsByVendor(cartData.panier)),
            reduction
          );
        } else {
          // ... code pour les promos admin ...
        }

        showAlert("Code promo appliqué avec succès", "success");
      })
      .catch((error) => {
        console.error("Error:", error);
        showAlert("Erreur lors de la validation du code promo", "danger");
      });
  }

  // Ajouter cette nouvelle fonction helper
  function applyPromoToDisplay(promoCode, promo, reduction) {
    document.getElementById("appliedPromoCode").value = promoCode;
    document.getElementById("activePromo").style.display = "block";
    document.getElementById("activePromoCode").textContent = `${promoCode} - ${
      promo.type_reduction === "pourcentage"
        ? promo.reduction_value + "%"
        : promo.reduction_value + "€"
    }`;
    document.getElementById("promoCodeInput").value = "";

    // Stocker l'ID de la promo dans localStorage
    localStorage.setItem("activePromoId", promo.id);
  }

  function removePromoCode() {
    try {
      document.getElementById("appliedPromoCode").value = "";
      document.getElementById("activePromo").style.display = "none";
      document.getElementById("activePromoCode").textContent = "";

      // Fetch current cart data and update totals
      fetch("../public/index.php?api=panier")
        .then((response) => response.json())
        .then((data) => {
          const productsBySeller = groupProductsByVendor(data.panier || []);
          const totalBeforePromo = calculateTotalBeforePromo(productsBySeller);
          updateTotalDisplay(totalBeforePromo, 0);
          showAlert("Code promo retiré", "info");
        })
        .catch((error) => {
          console.error("Error updating cart after promo removal:", error);
          showAlert("Erreur lors de la mise à jour du panier", "danger");
        });
    } catch (error) {
      console.error("Error removing promo code:", error);
      showAlert("Erreur lors du retrait du code promo", "danger");
    }

    localStorage.removeItem("activePromoId");
  }

  // Ajouter une fonction helper pour vérifier si un code promo est valide
  function isPromoCodeValid(promo) {
    const currentDate = new Date();
    const startDate = new Date(promo.date_debut);
    const endDate = new Date(promo.date_fin);

    return currentDate >= startDate && currentDate <= endDate;
  }

  // Modifier la fonction calculatePromoReduction pour gérer correctement les types de réduction
  function calculatePromoReduction(totalAmount, promo) {
    console.log("Calculating reduction for:", {
      totalAmount,
      type: promo.type_reduction,
      value: promo.reduction_value,
      max: promo.montant_max,
    });

    if (promo.type_reduction === "pourcentage") {
      let reduction = (totalAmount * Number(promo.reduction_value)) / 100;
      if (promo.montant_max && reduction > Number(promo.montant_max)) {
        reduction = Number(promo.montant_max);
      }
      return reduction;
    } else {
      // Pour une réduction en montant fixe
      return Math.min(Number(promo.reduction_value), totalAmount);
    }
  }

  // Modifier la fonction calculateTotalWithPromo
  function calculateTotalWithPromo(
    totalBeforePromo,
    productsBySeller,
    promoCode
  ) {
    fetch(`../public/index.php?api=promo&action=getPromo`)
      .then((response) => response.json())
      .then((data) => {
        // Trouver la promo correspondante
        const promo = data.promos.find((p) => p.code === promoCode);
        console.log("Promo trouvée:", promo);

        if (!promo) {
          throw new Error("Code promo non trouvé");
        }

        // Vérifier si la promo est active et valide
        if (!promo.actif || !isPromoCodeValid(promo)) {
          showAlert("Code promo inactif ou expiré", "warning");
          return;
        }

        let totalReduction = 0;

        // Si c'est une promo vendeur (non admin)
        if (Number(promo.ajoute_par_admin) !== 1) {
          const vendeurId = Number(promo.vendeur_id);

          // Vérifier si nous avons des produits de ce vendeur dans le panier
          let vendeurProducts = [];

          cartData.panier.forEach((product) => {
            console.log("Comparing:", {
              productUserId: Number(product.user_id),
              vendeurId: vendeurId,
              match: Number(product.user_id) === vendeurId,
            });

            if (Number(product.user_id) === vendeurId) {
              vendeurProducts.push(product);
            }
          });

          console.log("Produits du vendeur trouvés:", vendeurProducts);

          if (vendeurProducts.length === 0) {
            showAlert(
              "Aucun produit de ce vendeur dans votre panier",
              "warning"
            );
            return;
          }

          // Calculer le total des produits du vendeur
          const vendeurTotal = vendeurProducts.reduce(
            (sum, product) => sum + product.price * product.quantite_panier,
            0
          );

          console.log("Total produits vendeur:", vendeurTotal);
          console.log("Condition minimum:", promo.condition_min);

          // Vérifier le montant minimum
          if (vendeurTotal < Number(promo.condition_min || 0)) {
            showAlert(
              `Montant minimum de ${promo.condition_min}€ requis pour les produits du vendeur`,
              "warning"
            );
            return;
          }

          // Calculer la réduction
          totalReduction = calculatePromoReduction(vendeurTotal, promo);
          console.log("Réduction calculée:", totalReduction);
        } else {
          // Promo admin : s'applique sur tout le panier
          totalReduction = calculatePromoReduction(totalBeforePromo, promo);
        }

        // Mettre à jour l'affichage
        document.getElementById(
          "activePromoCode"
        ).textContent = `${promoCode} - ${
          promo.type_reduction === "pourcentage"
            ? promo.reduction_value + "%"
            : promo.reduction_value + "€"
        }`;

        updateTotalDisplay(totalBeforePromo, totalReduction);
      })
      .catch((error) => {
        console.error("Error applying promo:", error);
        showAlert("Erreur lors de l'application du code promo", "danger");
      });
  }

  // Simplifier calculateTotalWithPromo pour utiliser directement applyPromoCode
  function calculateTotalWithPromo(
    totalBeforePromo,
    productsBySeller,
    promoCode
  ) {
    fetch(`../public/index.php?api=promo&action=getPromo`)
      .then((response) => response.json())
      .then((data) => {
        const promo = data.promos.find((p) => p.code === promoCode);

        if (!promo) {
          throw new Error("Code promo non trouvé");
        }

        let totalReduction = 0;

        // Pour les promos vendeur
        if (Number(promo.ajoute_par_admin) !== 1) {
          const vendeurId = Number(promo.vendeur_id);
          const vendeurProducts = productsBySeller[vendeurId] || [];

          console.log("Vendeur ID:", vendeurId);
          console.log("Vendeur products:", vendeurProducts);

          const vendeurTotal = vendeurProducts.reduce(
            (sum, product) => sum + product.price * product.quantite_panier,
            0
          );

          if (vendeurTotal >= Number(promo.condition_min || 0)) {
            totalReduction = calculatePromoReduction(vendeurTotal, promo);
          }
        } else {
          // Pour les promos admin
          totalReduction = calculatePromoReduction(totalBeforePromo, promo);
        }

        updateTotalDisplay(totalBeforePromo, totalReduction);
      })
      .catch((error) => {
        console.error("Error applying promo:", error);
        showAlert("Erreur lors de l'application du code promo", "danger");
      });
  }

  // Modifier la fonction updateTotalDisplay pour plus de clarté
  function updateTotalDisplay(totalBeforePromo, reduction) {
    const elements = {
      total: document.getElementById("total"),
      reduction: document.getElementById("reduction"),
      fraisPort: document.getElementById("fraisPort"),
      totalPaye: document.getElementById("totalPaye"),
    };

    // Vérifier que tous les éléments existent
    if (!Object.values(elements).every((el) => el)) {
      console.error("Missing elements for display update");
      return;
    }

    const fraisPort = totalBeforePromo >= 80 ? 0 : 5;
    const totalFinal = Math.max(0, totalBeforePromo - reduction + fraisPort);

    try {
      elements.total.textContent = `${totalBeforePromo.toFixed(2)} €`;
      elements.reduction.textContent =
        reduction > 0 ? `-${reduction.toFixed(2)} €` : "0.00 €";
      elements.fraisPort.textContent =
        fraisPort > 0 ? `${fraisPort.toFixed(2)} €` : "Gratuit";
      elements.totalPaye.textContent = `${totalFinal.toFixed(2)} €`;
    } catch (error) {
      console.error("Error updating display:", error);
    }
  }
});
