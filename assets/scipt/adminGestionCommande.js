document.addEventListener("DOMContentLoaded", function () {
  loadAllCommandes();
});

function loadAllCommandes() {
  fetch("../../public/index.php?api=commande&action=getAllCommandes", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data?.success && data.commandes?.length > 0) {
        updateStats(data.commandes);
        displayCommandes(data.commandes);
      } else {
        document.querySelector("tbody").innerHTML = `
          <tr>
            <td colspan="5" class="text-center">Aucune commande trouvée</td>
          </tr>`;
      }
    })
    .catch((error) => console.error("Erreur:", error));
}

function updateStats(commandes) {
  const enCours = commandes.filter((c) => c.statut === "En attente").length;
  document.querySelector(".stat-card:nth-child(1) h2").textContent = enCours;
}

function displayCommandes(commandes) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  commandes.forEach((commande) => {
    const row = document.createElement("tr");
    const date = new Date(commande.date_commande).toLocaleDateString("fr-FR");
    const statusClass =
      commande.statut === "En attente" ? "bg-warning" : "bg-success";

    row.innerHTML = `
      <td>#${commande.id_commande}</td>
      <td>Client #${commande.id_user_commande}</td>
      <td>${date}</td>
      <td><span class="badge ${statusClass}">${commande.statut}</span></td>
      <td>
        ${
          commande.statut === "En attente"
            ? `<button onclick="validerCommande(${commande.id_commande})" class="btn btn-sm btn-success">Valider</button>`
            : `<button disabled class="btn btn-sm btn-success">Validé</button>`
        }
        <button onclick='showOrderDetails(${JSON.stringify(
          commande
        )})' class="btn btn-sm btn-info">Détails</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function validerCommande(id) {
  fetch("../../public/index.php?api=commande&action=valideCommande", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadAllCommandes();
      } else {
        alert("Erreur lors de la validation de la commande");
      }
    })
    .catch((error) => console.error("Erreur:", error));
}

function showOrderDetails(commande) {
  const products = commande.products.split(",");
  const prices = commande.prices.split(",");
  const quantities = commande.quantities.split(",");
  const images = commande.images.split(",");
  const productIds = commande.product_ids.split(",");

  let productsHtml = "";
  products.forEach((product, index) => {
    productsHtml += `
      <li class="list-group-item d-flex justify-content-between align-items-center" 
          onclick="window.location.href='../views/detail_produit.html?id=${
            productIds[index]
          }'" 
          style="cursor: pointer;">
        <div class="d-flex align-items-center">
          <img src="../${images[index] || "../img/imgProduct/default.jpg"}" 
               alt="${product}" 
               style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
          <span>${product}</span>
        </div>
        <span>
          ${quantities[index]} x €${parseFloat(prices[index]).toFixed(2)}
          <strong class="ms-2">€${(quantities[index] * prices[index]).toFixed(
            2
          )}</strong>
        </span>
      </li>
    `;
  });

  const modalHtml = `
    <div class="modal fade" id="orderDetails">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Détails commande #${
              commande.id_commande
            }</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Client ID: ${commande.id_user_commande}</p>
            <p>Date: ${new Date(commande.date_commande).toLocaleDateString(
              "fr-FR"
            )}</p>
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
  if (existingModal) existingModal.remove();

  // Add new modal
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("orderDetails"));
  modal.show();
}
