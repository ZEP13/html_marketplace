document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=commande&action=getCommandeByUser", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const currentOrdersTable = document.querySelector(
        ".commandeEnCour tbody"
      );
      const pastOrdersTable = document.querySelector(".CommandePasse tbody");

      currentOrdersTable.innerHTML = "";
      pastOrdersTable.innerHTML = "";

      if (data && data.commande && data.commande.length > 0) {
        let hasCurrentOrders = false;
        let hasPastOrders = false;

        data.commande.forEach((commande) => {
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

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${commande.id_commande}</td>
            <td>${formattedDate}</td>
            <td>${commande.statut || "Non spécifié"}</td>
            <td>€${parseFloat(commande.total_price).toFixed(2)}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick='showOrderDetails(${JSON.stringify(
                {
                  ...commande,
                  formattedDate,
                  productsDetails: products.map((product, index) => ({
                    name: product,
                    price: prices[index],
                    quantity: quantities[index],
                    image: images[index] || "../img/imgProduct/default.jpg",
                  })),
                }
              )})'>Voir</button>
            </td>
          `;

          if (commande.statut === "En attente") {
            currentOrdersTable.appendChild(row);
            hasCurrentOrders = true;
          } else {
            pastOrdersTable.appendChild(row);
            hasPastOrders = true;
          }
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

  const modalHtml = `
    <div class="modal fade" id="orderDetails" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Détails de la commande #${
              commande.id_commande
            }</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Date: ${commande.formattedDate}</p>
            <p>Statut: ${commande.statut}</p>
            <h6>Produits:</h6>
            <ul class="list-group mb-3">
              ${productsHtml}
              <li class="list-group-item d-flex justify-content-between">
                <strong>Total</strong>
                <strong>€${parseFloat(commande.total_price).toFixed(2)}</strong>
              </li>
            </ul>
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

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("orderDetails"));
  modal.show();
}

function redirect(id) {
  window.location.href = "../views/detail_produit.html?id=" + id;
}
