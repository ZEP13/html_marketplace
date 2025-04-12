document.addEventListener("DOMContentLoaded", function () {
  loadStats();
  loadPendingPromos();

  // Auto-refresh
  document
    .getElementById("autoRefresh")
    .addEventListener("change", function (e) {
      if (e.target.checked) {
        window.refreshInterval = setInterval(loadPendingPromos, 30000); // Refresh every 30 seconds
      } else {
        clearInterval(window.refreshInterval);
      }
    });

  // Filtres
  const filterButtons = document.querySelectorAll(".btn-group .btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      filterPromos(this.textContent.toLowerCase());
    });
  });
});

async function loadStats() {
  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=getPromo"
    );
    const data = await response.json();
    if (data.success) {
      const promos = data.promos;
      document.getElementById("pendingCount").textContent = promos.filter(
        (p) => !p.validé_par_admin
      ).length;
      document.getElementById("validatedCount").textContent = promos.filter(
        (p) => p.validé_par_admin
      ).length;
      document.getElementById("last24hCount").textContent =
        getValidatedLast24Hours(promos);
      document.getElementById("avgDiscount").textContent =
        calculateAverageDiscount(promos) + "%";
      document.getElementById("vendorCount").textContent =
        getUniqueVendorsCount(promos);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
  }
}

// Ajouter cette fonction manquante
function calculateAverageDiscount(promos) {
  // Filtrer les promos avec un type de réduction en pourcentage
  const percentagePromos = promos.filter(
    (p) => p.type_reduction === "pourcentage"
  );

  if (percentagePromos.length === 0) return 0;

  // Calculer la moyenne des réductions
  const total = percentagePromos.reduce(
    (sum, p) => sum + parseFloat(p.reduction_value),
    0
  );
  return Math.round(total / percentagePromos.length);
}

async function loadPendingPromos() {
  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=getPromo"
    );
    const data = await response.json();
    if (data.success) {
      // Maintenant on affiche toutes les promos, pas seulement celles en attente
      displayPendingPromos(data.promos);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des promotions:", error);
  }
}

function displayPendingPromos(promos) {
  const tbody = document.getElementById("pendingPromoList");
  tbody.innerHTML = "";

  promos.forEach((promo) => {
    let statusBadge, actionButtons;

    if (promo.refuse) {
      statusBadge = `<span class="badge bg-danger">Refusé</span>`;
      actionButtons = `
            <button class="btn btn-sm btn-warning" onclick="resetPromo(${promo.id})">
                <i class="fas fa-redo"></i>
            </button>
            <button class="btn btn-sm btn-info" onclick="showPromoDetails(${promo.id})">
                <i class="fas fa-eye"></i>
            </button>`;
    } else if (promo.validé_par_admin) {
      statusBadge = `<span class="badge bg-success">Validé</span>`;
      actionButtons = `
            <button class="btn btn-sm btn-info" onclick="showPromoDetails(${promo.id})">
                <i class="fas fa-eye"></i>
            </button>`;
    } else {
      statusBadge = `<span class="badge bg-warning">En attente</span>`;
      actionButtons = `
            <button class="btn btn-sm btn-success" onclick="validatePromo(${promo.id})">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="refusePromo(${promo.id})">
                <i class="fas fa-times"></i>
            </button>
            <button class="btn btn-sm btn-info" onclick="showPromoDetails(${promo.id})">
                <i class="fas fa-eye"></i>
            </button>`;
    }

    const row = `
        <tr data-status="${
          promo.refuse
            ? "refusé"
            : promo.validé_par_admin
            ? "validé"
            : "en attente"
        }">
            <td><span class="badge bg-secondary">${promo.code}</span></td>
            <td>
                <div>${
                  promo.vendeur_id ? "Vendeur #" + promo.vendeur_id : "Global"
                }</div>
                <div>${statusBadge}</div>
            </td>
            <td>${promo.description}</td>
            <td>${promo.reduction_value}${
      promo.type_reduction === "pourcentage" ? "%" : "€"
    }</td>
            <td>
                <div>${formatDate(promo.date_debut)} - ${formatDate(
      promo.date_fin
    )}</div>
                <small class="text-muted">${calculateDuration(
                  promo.date_debut,
                  promo.date_fin
                )} jours</small>
            </td>
            <td>
                <div>Min: ${promo.condition_min || 0}€</div>
                <div>Max: ${promo.montant_max || "N/A"}</div>
            </td>
            <td class="table-actions">${actionButtons}</td>
        </tr>
    `;
    tbody.innerHTML += row;
  });

  // Appliquer le filtre actif
  const activeFilter = document.querySelector(".btn-group .active");
  if (activeFilter) {
    filterPromos(activeFilter.textContent.toLowerCase());
  }
}

async function validatePromo(id) {
  if (!confirm("Êtes-vous sûr de vouloir valider cette promotion ?")) return;

  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=validatePromo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_promo: id }),
      }
    );
    const data = await response.json();
    if (data.success) {
      alert("Promotion validée avec succès");
      loadStats();
      loadPendingPromos();
    } else {
      alert(data.message || "Erreur lors de la validation");
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonctions utilitaires
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function getValidatedLast24Hours(promos) {
  const now = new Date();
  const yesterday = new Date(now - 24 * 60 * 60 * 1000);
  return promos.filter((p) => {
    const validationDate = new Date(p.date_validation);
    return (
      p.validé_par_admin && validationDate >= yesterday && validationDate <= now
    );
  }).length;
}

function getUniqueVendorsCount(promos) {
  return new Set(
    promos.filter((p) => !p.validé_par_admin).map((p) => p.vendeur_id)
  ).size;
}

function filterPromos(filter) {
  const rows = document.querySelectorAll("#pendingPromoList tr");

  rows.forEach((row) => {
    const status = row.getAttribute("data-status");
    switch (filter) {
      case "tous":
        row.style.display = "";
        break;
      case "en attente":
        row.style.display = status === "en attente" ? "" : "none";
        break;
      case "validés":
        row.style.display = status === "validé" ? "" : "none";
        break;
      case "refusés":
        row.style.display = status === "refusé" ? "" : "none";
        break;
    }
  });
}

// Ajouter aussi une fonction pour refuser une promo
async function refusePromo(id) {
  if (!confirm("Êtes-vous sûr de vouloir refuser cette promotion ?")) return;

  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=refusePromo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_promo: id }),
      }
    );
    const data = await response.json();
    if (data.success) {
      alert("Promotion refusée");
      loadStats();
      loadPendingPromos();
    } else {
      alert(data.message || "Erreur lors du refus");
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Ajouter une fonction pour afficher les détails
function showPromoDetails(id) {
  const promoDetailModal = new bootstrap.Modal(
    document.getElementById("promoDetailModal")
  );

  // Stocker l'ID de la promo dans le modal
  document.getElementById("promoDetailModal").dataset.promoId = id;

  // Charger les détails de la promo
  fetch(`../../public/index.php?api=promo&action=getPromoById&id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Remplir le modal avec les détails
        const modalBody = document.querySelector(
          "#promoDetailModal .modal-body"
        );
        modalBody.innerHTML = `
                  <div class="mb-3">
                      <strong>Code:</strong> ${data.promo.code}
                  </div>
                  <div class="mb-3">
                      <strong>Description:</strong> ${data.promo.description}
                  </div>
                  <div class="mb-3">
                      <strong>Réduction:</strong> ${
                        data.promo.reduction_value
                      }${
          data.promo.type_reduction === "pourcentage" ? "%" : "€"
        }
                  </div>
                  <div class="mb-3">
                      <strong>Période:</strong> ${formatDate(
                        data.promo.date_debut
                      )} - ${formatDate(data.promo.date_fin)}
                  </div>
                  <div class="mb-3">
                      <strong>Conditions:</strong>
                      <br>Minimum: ${data.promo.condition_min || 0}€
                      <br>Maximum: ${data.promo.montant_max || "Non défini"}
                  </div>
              `;
      }
    })
    .catch((error) => console.error("Erreur:", error));

  promoDetailModal.show();
}

// Mettre à jour les fonctions de validation et de refus
function validatePromoFromModal() {
  const modal = document.getElementById("promoDetailModal");
  const promoId = modal.dataset.promoId;
  if (promoId) {
    validatePromo(promoId);
    bootstrap.Modal.getInstance(modal).hide();
  }
}

function refusePromoFromModal() {
  const modal = document.getElementById("promoDetailModal");
  const promoId = modal.dataset.promoId;
  if (promoId) {
    refusePromo(promoId);
    bootstrap.Modal.getInstance(modal).hide();
  }
}

async function resetPromo(id) {
  if (!confirm("Êtes-vous sûr de vouloir réinitialiser cette promotion ?"))
    return;

  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=resetPromo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_promo: id }),
      }
    );
    const data = await response.json();
    if (data.success) {
      alert("Promotion réinitialisée");
      loadStats();
      loadPendingPromos();
    } else {
      alert(data.message || "Erreur lors de la réinitialisation");
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
}
