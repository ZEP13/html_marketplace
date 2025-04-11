let panierInitialized = false;
let isLoading = false;

function initializePanier() {
  if (panierInitialized) return;
  panierInitialized = true;
  loadPanierContent();
  setupPanierEventListeners();
  updateCartBadge(); // Ajouter cette ligne
}
const alertContainer = document.getElementById("alertContainernav");

function loadPanierContent() {
  const cardPanier = document.getElementById("cardPanier");
  const totalPanier = document.getElementById("totalPanier");

  // Afficher "Votre panier est vide" par défaut
  cardPanier.innerHTML =
    '<p class="text-center text-muted">Votre panier est vide</p>';
  totalPanier.textContent = "0.00 €";

  fetch("../public/index.php?api=panier")
    .then((response) => response.json())
    .then((data) => {
      if (
        data.success &&
        Array.isArray(data.panier) &&
        data.panier.length > 0
      ) {
        let total = 0; // Déplacer la déclaration ici et corriger à let

        // Calculer le total avant de générer le HTML
        total = data.panier.reduce((sum, product) => {
          return sum + product.price * product.quantite_panier;
        }, 0);

        cardPanier.innerHTML =
          data.panier.length > 0
            ? data.panier
                .map(
                  (product) => `
              <div class="card mb-3">
                <div class="row g-0">
                  <div class="col-md">
                    <img src="${
                      product.image || "../img/imgProduct/default.jpg"
                    }" 
                         class="img-fluid rounded-start" 
                         alt="${product.title}"
                         onerror="this.src='../img/imgProduct/default.jpg'"
                         style="object-fit: cover; height: 100%;">
                  </div>
                  <div class="col-md-8">
                    <div class="card-body">
                      <h5 class="card-title mb-2">${product.title}</h5>
                      <p class="card-text"><small class="text-muted">Quantité:</small>
                        <input type="number" 
                               min="1" 
                               value="${product.quantite_panier}" 
                               class="quantity-input" 
                               data-id="${product.id_produit}"
                               style="margin-left:3px; width:50px">
                      </p>
                      <p class="card-text"><strong>${
                        product.price
                      }€</strong></p>
                      <button class="btn btn-danger btn-sm delete-btn" 
                              data-id="${product.id_produit}">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>`
                )
                .join("")
            : '<p class="text-center text-muted">Votre panier est vide</p>';

        // Mettre à jour le total
        totalPanier.textContent = total.toFixed(2) + " €";
      }
    })
    .catch((error) => console.error("Error loading cart:", error))
    .finally(() => {
      isLoading = false;
    });
}

// Ajouter cette nouvelle fonction
function updatePanierContent() {
  const cardPanier = document.getElementById("cardPanier");
  const totalPanier = document.getElementById("totalPanier");
  let total = 0;

  fetch("../public/index.php?api=panier")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && Array.isArray(data.panier)) {
        total = data.panier.reduce((sum, product) => {
          return sum + product.price * product.quantite_panier;
        }, 0);

        cardPanier.innerHTML =
          data.panier.length > 0
            ? data.panier
                .map(
                  (product) => `
              <div class="card mb-3">
                <div class="row g-0">
                  <div class="col-md">
                    <img src="${
                      product.image || "../img/imgProduct/default.jpg"
                    }" 
                         class="img-fluid rounded-start" 
                         alt="${product.title}"
                         onerror="this.src='../img/imgProduct/default.jpg'"
                         style="object-fit: cover; height: 100%;">
                  </div>
                  <div class="col-md-8">
                    <div class="card-body">
                      <h5 class="card-title mb-2">${product.title}</h5>
                      <p class="card-text"><small class="text-muted">Quantité:</small>
                        <input type="number" 
                               min="1" 
                               value="${product.quantite_panier}" 
                               class="quantity-input" 
                               data-id="${product.id_produit}"
                               style="margin-left:3px; width:50px">
                      </p>
                      <p class="card-text"><strong>${
                        product.price
                      }€</strong></p>
                      <button class="btn btn-danger btn-sm delete-btn" 
                              data-id="${product.id_produit}">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>`
                )
                .join("")
            : '<p class="text-center text-muted">Votre panier est vide</p>';

        totalPanier.textContent = total.toFixed(2) + " €";
      }
    })
    .catch((error) => console.error("Error updating cart:", error));
}

// Exposer la fonction globalement
window.updatePanierContent = updatePanierContent;

function setupPanierEventListeners() {
  document.addEventListener("click", function (e) {
    if (e.target.matches(".bi-trash") || e.target.closest(".delete-btn")) {
      const deleteButton = e.target.closest(".delete-btn");
      const card = deleteButton.closest(".card");
      const id_produit = deleteButton.getAttribute("data-id");

      fetch("../public/index.php?api=panier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id_produit: id_produit }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Supprimer la carte immédiatement
            if (card) card.remove();

            // Vérifier s'il reste des produits dans le panier
            const cardPanier = document.getElementById("cardPanier");
            const remainingCards = cardPanier.querySelectorAll(".card").length;

            if (remainingCards === 0) {
              cardPanier.innerHTML =
                '<p class="text-center text-muted">Votre panier est vide</p>';
              document.getElementById("totalPanier").textContent = "0.00 €";
            }

            updateCartBadge();
            if (alertContainer) {
              alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            }
          } else {
            if (alertContainer) {
              alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target.matches(".quantity-input")) {
      const alertContainer = document.getElementById("alertContainernav");
      const quantityInput = e.target;
      const id_produit = quantityInput.getAttribute("data-id");
      const newQuantity = parseInt(quantityInput.value, 10);
      const totalPanier = document.getElementById("totalPanier");

      if (newQuantity < 0 || isNaN(newQuantity)) {
        if (alertContainer) {
          alertContainer.innerHTML = `<div class="alert alert-danger">Invalid quantity.</div>`;
        }
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
        .then((data) => {
          if (data.success && alertContainer) {
            alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            updateCartBadge(); // Ajouter cette ligne

            // Récupérer le nouveau total du panier
            fetch("../public/index.php?api=panier")
              .then((response) => response.json())
              .then((cartData) => {
                if (cartData.success && Array.isArray(cartData.panier)) {
                  const newTotal = cartData.panier.reduce((sum, product) => {
                    return sum + product.price * product.quantite_panier;
                  }, 0);
                  totalPanier.textContent = newTotal.toFixed(2) + " €";
                }
              });
          } else if (alertContainer) {
            alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
          }
        })
        .catch((error) => {
          console.error("Error updating quantity:", error);
          if (alertContainer) {
            alertContainer.innerHTML = `<div class="alert alert-danger">Error updating the quantity.</div>`;
          }
        });
    }
  });
}

// Supprimer la fonction totalPanier() qui n'est plus nécessaire

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;

  fetch("../public/index.php?api=panier")
    .then((response) => response.json())
    .then((data) => {
      if (data.success && Array.isArray(data.panier)) {
        // Compter le nombre de produits distincts au lieu de la somme des quantités
        const distinctItems = data.panier.length;

        if (distinctItems > 0) {
          badge.textContent = distinctItems;
          badge.style.display = "block";
        } else {
          badge.style.display = "none";
        }
      }
    })
    .catch((error) => {
      console.error("Error updating badge:", error);
      badge.style.display = "none";
    });
}

window.updateCartBadge = updateCartBadge;
window.initializePanier = initializePanier;
