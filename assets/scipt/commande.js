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
  commande.productsDetails.forEach((product, index) => {
    productsHtml += `
      <li class="list-group-item d-flex justify-content-between align-items-center" 
          onclick="redirect(${commande.product_ids.split(",")[index]})" 
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
        <span>
          ${product.quantity} x €${parseFloat(product.price).toFixed(2)}
          <strong class="ms-2">€${(product.quantity * product.price).toFixed(
            2
          )}</strong>
        </span>
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

function redirect(id) {
  window.location.href = "../views/detail_produit.html?id=" + id;
}
