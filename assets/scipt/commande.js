document.addEventListener("DOMContentLoaded", function () {
  // Fetch commandes and promos in parallel
  Promise.all([
    fetch("../public/index.php?api=commande&action=getCommandeByUser", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }),
    fetch("../public/index.php?api=promo&action=getPromo", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }),
  ])
    .then(([commandesResponse, promosResponse]) =>
      Promise.all([commandesResponse.json(), promosResponse.json()])
    )
    .then(([commandesData, promosData]) => {
      console.log("Commandes:", commandesData);
      console.log("Promos:", promosData);

      const currentOrdersTable = document.querySelector(
        ".commandeEnCour tbody"
      );
      const pastOrdersTable = document.querySelector(".CommandePasse tbody");

      currentOrdersTable.innerHTML = "";
      pastOrdersTable.innerHTML = "";

      if (
        commandesData &&
        commandesData.commande &&
        commandesData.commande.length > 0
      ) {
        let hasCurrentOrders = false;
        let hasPastOrders = false;

        commandesData.commande.forEach((commande) => {
          // Find associated promo if exists
          const promo = commande.promo_id
            ? promosData.promos.find((p) => p.id === commande.promo_id)
            : null;

          const products = commande.products.split(",");
          const prices = commande.prices.split(",");
          const quantities = commande.quantities.split(",");
          const images = commande.images.split(",");

          const commandeDate = new Date(commande.date_commande);
          const formattedDate = commandeDate.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });

          // Calculate final price with promo
          const totalBeforePromo = parseFloat(commande.total_price);
          let reduction = 0;

          if (promo) {
            if (promo.type_reduction === "pourcentage") {
              reduction = totalBeforePromo * (promo.reduction_value / 100);
            } else if (promo.type_reduction === "montant") {
              reduction = promo.reduction_value;
            }
          }

          const finalTotal = totalBeforePromo - reduction;

          const row = document.createElement("tr");
          const commandeData = {
            ...commande,
            formattedDate,
            promo,
            reduction,
            finalTotal,
            productsDetails: products.map((product, index) => ({
              name: product,
              price: prices[index],
              quantity: quantities[index],
              image: images[index] || "../img/imgProduct/default.jpg",
            })),
          };

          row.innerHTML = `
            <td>${commande.id_commande}</td>
            <td>${formattedDate}</td>
            <td>${commande.statut || "Non spécifié"}</td>
            <td>
              ${
                promo
                  ? `
                <span class="text-muted text-decoration-line-through">€${totalBeforePromo.toFixed(
                  2
                )}</span><br>
                <span class="text-success">€${finalTotal.toFixed(2)}</span>
                <small class="d-block text-muted">(Code: ${promo.code})</small>
              `
                  : `€${totalBeforePromo.toFixed(2)}`
              }
            </td>
            <td>
              <button class="btn btn-primary btn-sm" data-commande='${JSON.stringify(
                commandeData
              ).replace(/'/g, "&#39;")}'>Voir</button>
            </td>
          `;

          // Add click event listener to the button after adding the row to the DOM
          if (commande.statut === "En attente") {
            currentOrdersTable.appendChild(row);
            hasCurrentOrders = true;
          } else {
            pastOrdersTable.appendChild(row);
            hasPastOrders = true;
          }

          // Add click event listener
          const button = row.querySelector("button");
          button.addEventListener("click", function () {
            const commandeData = JSON.parse(this.getAttribute("data-commande"));
            showOrderDetails(commandeData);
          });
        });

        // Afficher le message si aucune commande en cours
        if (!hasCurrentOrders) {
          currentOrdersTable.innerHTML = `
            <tr>
              <td colspan="5" class="text-center py-4">
                <p class="text-muted mb-0">Aucune commande en cours pour le moment...</p>
              </td>
            </tr>`;
        }

        // Afficher le message si aucune commande passée
        if (!hasPastOrders) {
          pastOrdersTable.innerHTML = `
            <tr>
              <td colspan="5" class="text-center py-4">
                <p class="text-muted mb-0">Aucune ancienne commande</p>
              </td>
            </tr>`;
        }
      } else {
        const noOrderMessageCurrent = `
          <tr>
            <td colspan="5" class="text-center py-4">
              <p class="text-muted mb-0">Aucune commande en cours pour le moment...</p>
            </td>
          </tr>`;

        const noOrderMessagePast = `
          <tr>
            <td colspan="5" class="text-center py-4">
              <p class="text-muted mb-0">Aucune commande passée pour le moment...</p>
            </td>
          </tr>`;

        currentOrdersTable.innerHTML = noOrderMessageCurrent;
        pastOrdersTable.innerHTML = noOrderMessagePast;
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
      const tables = document.querySelectorAll("tbody");
      tables.forEach((table) => {
        table.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4">
              <p class="text-danger mb-0">Erreur lors du chargement des commandes</p>
            </td>
          </tr>`;
      });
    });
});

function showOrderDetails(commande) {
  let productsHtml = "";

  const checkReviews = commande.product_ids.split(",").map((productId) =>
    fetch(
      `../public/index.php?api=review&action=checkUserReview&productId=${productId}`,
      {
        credentials: "include",
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
  );

  Promise.all(checkReviews)
    .then((reviewResults) => {
      commande.productsDetails.forEach((product, index) => {
        const hasReview = reviewResults[index].hasReview;
        const productId = commande.product_ids.split(",")[index];

        productsHtml += `
          <li class="list-group-item d-flex justify-content-between align-items-center" 
              onclick="redirect(${productId})" 
              style="cursor: pointer; transition: background-color 0.3s;"
              onmouseover="this.style.backgroundColor='#f8f9fa'"
              onmouseout="this.style.backgroundColor=''" 
          >
            <div class="d-flex align-items-center">
              <img src="${product.image || "../../img/imgProduct/default.jpg"}" 
                   alt="${product.name}" 
                   style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
              <span class="text-primary">${product.name}</span>
            </div>

            ${
              commande.statut === "Envoye"
                ? `
              <div class="mx-3">
                <button class="btn btn-outline-primary btn-sm ${
                  hasReview ? "disabled" : ""
                }" 
                        onclick="event.stopPropagation(); ${
                          hasReview
                            ? ""
                            : `showReviewModal('${product.name}', ${productId})`
                        }"
                        ${hasReview ? "disabled" : ""}>
                  ${hasReview ? "Avis déjà donné" : "Ajouter un avis"}
                </button>
              </div>
            `
                : ""
            }

            <div class="ms-auto">
              <span>
                ${product.quantity} x €${parseFloat(product.price).toFixed(2)}
                <strong class="ms-2">€${(
                  product.quantity * product.price
                ).toFixed(2)}</strong>
              </span>
            </div>
          </li>
        `;
      });

      // Calculer le total avec promo
      const totalBeforePromo = parseFloat(commande.total_price);
      let reduction = 0;

      if (commande.promo) {
        // S'assurer que reduction_value est un nombre
        const reductionValue = parseFloat(commande.promo.reduction_value);

        if (commande.promo.type_reduction === "pourcentage") {
          reduction = totalBeforePromo * (reductionValue / 100);
        } else if (commande.promo.type_reduction === "montant") {
          reduction = reductionValue;
        }
      }

      // S'assurer que reduction est un nombre
      reduction = parseFloat(reduction) || 0;
      const finalTotal = totalBeforePromo - reduction;

      const modalHtml = `
        <div class="modal fade" id="orderDetails" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Détails de la commande #${
                  commande.id_commande
                }</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p class="mb-1"><strong>Date:</strong> ${
                      commande.formattedDate
                    }</p>
                    <p class="mb-1"><strong>Statut:</strong> ${
                      commande.statut
                    }</p>
                  </div>
                </div>
                <h6>Produits:</h6>
                <ul class="list-group mb-3">
                  ${productsHtml}
                  ${
                    commande.promo
                      ? `
                    <li class="list-group-item d-flex justify-content-between text-muted">
                      <span>Sous-total</span>
                      <span>€${totalBeforePromo.toFixed(2)}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between text-success">
                      <span>Réduction (${commande.promo.code})</span>
                      <span>-€${reduction.toFixed(2)}</span>
                    </li>
                  `
                      : ""
                  }
                  <li class="list-group-item d-flex justify-content-between">
                    <strong>Total final</strong>
                    <strong>€${finalTotal.toFixed(2)}</strong>
                  </li>
                </ul>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Remove existing modal if any
      const existingModal = document.querySelector("#orderDetails");
      if (existingModal) {
        existingModal.remove();
      }

      // Add new modal to the document
      document.body.insertAdjacentHTML("beforeend", modalHtml);

      // Initialize and show the modal
      const modalElement = document.getElementById("orderDetails");
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    })
    .catch((error) => {
      console.error("Error checking reviews:", error);
      // Continue with default modal creation
      showDefaultOrderDetails(commande);
    });
}

// Add this helper function for fallback
function showDefaultOrderDetails(commande) {
  let productsHtml = "";

  commande.productsDetails.forEach((product, index) => {
    const productId = commande.product_ids.split(",")[index];

    productsHtml += `
      <li class="list-group-item d-flex justify-content-between align-items-center" 
          onclick="redirect(${productId})" 
          style="cursor: pointer; transition: background-color 0.3s;"
          onmouseover="this.style.backgroundColor='#f8f9fa'"
          onmouseout="this.style.backgroundColor=''" 
      >
        <div class="d-flex align-items-center">
          <img src="${product.image || "../../img/imgProduct/default.jpg"}" 
               alt="${product.name}" 
               style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
          <span class="text-primary">${product.name}</span>
        </div>

        ${
          commande.statut === "envoyée"
            ? `
          <div class="mx-3">
            <button class="btn btn-outline-primary btn-sm" 
                    onclick="event.stopPropagation(); showReviewModal('${product.name}', ${productId})">
              Ajouter un avis
            </button>
          </div>
        `
            : ""
        }

        <div class="ms-auto">
          <span>
            ${product.quantity} x €${parseFloat(product.price).toFixed(2)}
            <strong class="ms-2">€${(product.quantity * product.price).toFixed(
              2
            )}</strong>
          </span>
        </div>
      </li>
    `;
  });

  // Calculer le total avec promo
  const totalBeforePromo = parseFloat(commande.total_price);
  let reduction = 0;

  if (commande.promo) {
    // S'assurer que reduction_value est un nombre
    const reductionValue = parseFloat(commande.promo.reduction_value);

    if (commande.promo.type_reduction === "pourcentage") {
      reduction = totalBeforePromo * (reductionValue / 100);
    } else if (commande.promo.type_reduction === "montant") {
      reduction = reductionValue;
    }
  }

  // S'assurer que reduction est un nombre
  reduction = parseFloat(reduction) || 0;
  const finalTotal = totalBeforePromo - reduction;

  const modalHtml = `
    <div class="modal fade" id="orderDetails" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Détails de la commande #${
              commande.id_commande
            }</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="mb-1"><strong>Date:</strong> ${
                  commande.formattedDate
                }</p>
                <p class="mb-1"><strong>Statut:</strong> ${commande.statut}</p>
              </div>
            </div>
            <h6>Produits:</h6>
            <ul class="list-group mb-3">
              ${productsHtml}
              ${
                commande.promo
                  ? `
                <li class="list-group-item d-flex justify-content-between text-muted">
                  <span>Sous-total</span>
                  <span>€${totalBeforePromo.toFixed(2)}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between text-success">
                  <span>Réduction (${commande.promo.code})</span>
                  <span>-€${reduction.toFixed(2)}</span>
                </li>
              `
                  : ""
              }
              <li class="list-group-item d-flex justify-content-between">
                <strong>Total final</strong>
                <strong>€${finalTotal.toFixed(2)}</strong>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.querySelector("#orderDetails");
  if (existingModal) {
    existingModal.remove();
  }

  // Add new modal to the document
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Initialize and show the modal
  const modalElement = document.getElementById("orderDetails");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

function showReviewModal(productName, productId) {
  const modalHtml = `
    <div class="modal fade" id="reviewModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Avis pour ${productName}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="reviewAlertContainer"></div>
            <div id="reviewFormContainer">
              <form id="reviewForm">
                <input type="hidden" name="productId" value="${productId}">
                <div class="mb-3">
                  <label class="form-label">Note</label>
                  <div class="star-rating">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (num) => `
                      <span class="star" data-rating="${num}" onmouseover="highlightStars(${num})" onmouseout="resetStars()" onclick="selectRating(${num})">★</span>
                    `
                      )
                      .join("")}
                  </div>
                  <input type="hidden" name="rating" id="ratingInput" value="0">
                </div>
                <div class="mb-3">
                  <label class="form-label">Commentaire</label>
                  <textarea class="form-control" name="comment" rows="3" required></textarea>
                </div>
              </form>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-primary" onclick="submitReview()">Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.querySelector("#reviewModal");
  if (existingModal) {
    existingModal.remove();
  }

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("reviewModal"));
  modal.show();
}

// Ajoutez ces nouvelles fonctions pour gérer les étoiles
function highlightStars(num) {
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    star.style.color = index < num ? "#ffd700" : "#ddd";
  });
}

function resetStars() {
  const rating = parseInt(document.getElementById("ratingInput").value) || 0;
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, index) => {
    star.style.color = index < rating ? "#ffd700" : "#ddd";
  });
}

function selectRating(num) {
  document.getElementById("ratingInput").value = num;
  resetStars();
}

// Remplacer le style existant par celui-ci
const style = document.createElement("style");
style.textContent = `
  .star-rating {
    font-size: 24px;
    display: flex;
    gap: 5px;
  }
  .star {
    cursor: pointer;
    color: #ddd;
    transition: color 0.2s;
    user-select: none;
  }
`;
document.head.appendChild(style);

function submitReview() {
  const form = document.getElementById("reviewForm");
  const alertContainer = document.getElementById("reviewAlertContainer");
  const modalBody = document.querySelector("#reviewModal .modal-body");
  const modalFooter = document.querySelector("#reviewModal .modal-footer");
  const formData = new FormData();

  const rating = document.getElementById("ratingInput").value;
  const comment = form.querySelector('textarea[name="comment"]').value;
  const productId = form.querySelector('input[name="productId"]').value;

  if (rating === "0" || !rating) {
    alertContainer.innerHTML = `
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        Veuillez sélectionner une note entre 1 et 5 étoiles
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
    return;
  }

  if (!comment.trim()) {
    alertContainer.innerHTML = `
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        Veuillez ajouter un commentaire
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
    return;
  }

  formData.append("action", "addReview");
  formData.append("rating", rating);
  formData.append("comment", comment);
  formData.append("productId", productId);

  // Afficher le loader
  document.getElementById("reviewFormContainer").innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Envoi en cours...</span>
      </div>
      <p>Envoi de votre avis...</p>
    </div>
  `;

  fetch("../public/index.php?api=review&action=addReview", {
    method: "POST",
    body: formData,
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) throw new Error("Erreur réseau");
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        // Afficher l'animation de succès
        modalBody.innerHTML = `
          <div class="text-center">
            <div class="success-checkmark">
              <div class="check-icon">
                <span class="icon-line line-tip"></span>
                <span class="icon-line line-long"></span>
                <div class="icon-circle"></div>
                <div class="icon-fix"></div>
              </div>
            </div>
            <h4 class="mt-3">Merci pour votre avis !</h4>
            <p class="text-muted">Votre retour est précieux pour nous et aide les autres utilisateurs.</p>
          </div>
        `;
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("reviewModal")
          );
          modal.hide();
          location.reload();
        }, 2000);
      } else {
        throw new Error(data.message || "Erreur lors de l'envoi de l'avis");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      modalBody.innerHTML = `
        <div class="alert alert-danger">
          ${error.message || "Erreur lors de l'envoi de l'avis"}
        </div>
        ${form.outerHTML}
      `;
      modalFooter.style.display = "flex";
    });
}

// Ajouter le CSS pour l'animation de la coche
const successCheckmarkStyle = document.createElement("style");
successCheckmarkStyle.textContent = `
  .success-checkmark {
    width: 80px;
    height: 80px;
    margin: 0 auto;
  }
  .check-icon {
    width: 80px;
    height: 80px;
    position: relative;
    border-radius: 50%;
    box-sizing: content-box;
    border: 4px solid #4CAF50;
  }
  .check-icon::before {
    top: 3px;
    left: -2px;
    width: 30px;
    transform-origin: 100% 50%;
    border-radius: 100px 0 0 100px;
  }
  .check-icon::after {
    top: 0;
    left: 30px;
    width: 60px;
    transform-origin: 0 50%;
    border-radius: 0 100px 100px 0;
    animation: rotate-circle 4.25s ease-in;
  }
  .check-icon::before, .check-icon::after {
    content: '';
    height: 100px;
    position: absolute;
    background: #FFFFFF;
    transform: rotate(-45deg);
  }
  .icon-line {
    height: 5px;
    background-color: #4CAF50;
    display: block;
    border-radius: 2px;
    position: absolute;
    z-index: 10;
  }
  .icon-line.line-tip {
    top: 46px;
    left: 14px;
    width: 25px;
    transform: rotate(45deg);
    animation: icon-line-tip 0.75s;
  }
  .icon-line.line-long {
    top: 38px;
    right: 8px;
    width: 47px;
    transform: rotate(-45deg);
    animation: icon-line-long 0.75s;
  }
  @keyframes icon-line-tip {
    0% {
      width: 0;
      left: 1px;
      top: 19px;
    }
    54% {
      width: 0;
      left: 1px;
      top: 19px;
    }
    70% {
      width: 50px;
      left: -8px;
      top: 37px;
    }
    84% {
      width: 17px;
      left: 21px;
      top: 48px;
    }
    100% {
      width: 25px;
      left: 14px;
      top: 46px;
    }
  }
  @keyframes icon-line-long {
    0% {
      width: 0;
      right: 46px;
      top: 54px;
    }
    65% {
      width: 0;
      right: 46px;
      top: 54px;
    }
    84% {
      width: 55px;
      right: 0px;
      top: 35px;
    }
    100% {
      width: 47px;
      right: 8px;
      top: 38px;
    }
  }
`;
document.head.appendChild(successCheckmarkStyle);

function redirect(id) {
  window.location.href = "../views/detail_produit.html?id=" + id;
}
