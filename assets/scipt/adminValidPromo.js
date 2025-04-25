document.addEventListener("DOMContentLoaded", function () {
  loadStats();
  loadPendingPromos();

  document
    .getElementById("autoRefresh")
    .addEventListener("change", function (e) {
      if (e.target.checked) {
        window.refreshInterval = setInterval(loadPendingPromos, 30000);
      } else {
        clearInterval(window.refreshInterval);
      }
    });

  // Add active class to "Tous" button by default
  document.querySelector(".btn-group .btn:first-child").classList.add("active");

  // Add click event listeners to filter buttons
  document.querySelectorAll(".btn-group .btn").forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      document.querySelectorAll(".btn-group .btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      // Add active class to clicked button
      this.classList.add("active");

      // Get filter value and apply it
      const filter = this.textContent.toLowerCase().trim();
      filterPromosByStatus(filter);
    });
  });
});

function loadStats() {
  fetch("../../public/index.php?api=promo&action=getVendorPromos")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateStats(data.promos);
      }
    })
    .catch((error) => showAlert("Erreur chargement statistiques", "danger"));
}

function loadPendingPromos() {
  fetch("../../public/index.php?api=promo&action=getVendorPromos")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.success) {
        throw new Error(data.error || "Failed to load promotions");
      }
      const promos = data.promos || [];
      displayPromos(promos);
      updateStats(promos);
    })
    .catch((error) => {
      console.error("Error loading promotions:", error);
      showAlert("Erreur lors du chargement des promotions", "danger");
    });
}

function validatePromo(id) {
  if (!confirm("Confirmer la validation de cette promotion ?")) return;

  const formData = new FormData();
  formData.append("id", id);

  fetch("../../public/index.php?api=promo&action=validateVendorPromo", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        showAlert("Promotion validée avec succès", "success");
        loadStats();
        loadPendingPromos();
      } else {
        showAlert(result.error || "Erreur lors de la validation", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors de la validation", "danger"));
}

function refusePromo(id) {
  if (!confirm("Confirmer le refus de cette promotion ?")) return;

  const formData = new FormData();
  formData.append("id", id);

  fetch("../../public/index.php?api=promo&action=refuseVendorPromo", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        showAlert("Promotion refusée", "success");
        loadStats();
        loadPendingPromos();
      } else {
        showAlert(result.error || "Erreur lors du refus", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors du refus", "danger"));
}

function resetPromo(id) {
  if (!confirm("Réinitialiser cette promotion ?")) return;

  const formData = new FormData();
  formData.append("id", id);

  fetch("../../public/index.php?api=promo&action=resetVendorPromo", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        showAlert("Promotion réinitialisée", "success");
        loadStats();
        loadPendingPromos();
      } else {
        showAlert(
          result.error || "Erreur lors de la réinitialisation",
          "danger"
        );
      }
    })
    .catch((error) =>
      showAlert("Erreur lors de la réinitialisation", "danger")
    );
}

function updateStats(promos) {
  try {
    // Calculate statistics
    const pending =
      promos.filter((p) => !p.validé_par_admin && !p.refuse).length || 0;
    const validated = promos.filter((p) => p.validé_par_admin).length || 0;
    const refused = promos.filter((p) => p.refuse).length || 0;
    const avgDiscount = calculateAverageDiscount(promos);

    // Update DOM elements if they exist
    const elements = {
      pendingCount: pending,
      validatedCount: validated,
      refusedCount: refused,
      avgDiscount: avgDiscount + "%",
      vendorCount: new Set(
        promos.filter((p) => p.vendeur_id).map((p) => p.vendeur_id)
      ).size,
    };

    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    }
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

function calculateAverageDiscount(promos) {
  const validPromos = promos.filter(
    (p) => p.validé_par_admin && p.reduction_value
  );
  if (!validPromos.length) return 0;
  const total = validPromos.reduce(
    (sum, p) => sum + parseFloat(p.reduction_value),
    0
  );
  return Math.round(total / validPromos.length);
}

function getActionButtons(promo) {
  if (promo.refuse) {
    return `
            <button class="btn btn-sm btn-warning" onclick="resetPromo(${promo.id})">
                <i class="fas fa-redo"></i>
            </button>
            <button class="btn btn-sm btn-info" onclick="showPromoDetails(${promo.id})">
                <i class="fas fa-eye"></i>
            </button>`;
  }

  if (promo.validé_par_admin) {
    return `
            <button class="btn btn-sm btn-info" onclick="showPromoDetails(${promo.id})">
                <i class="fas fa-eye"></i>
            </button>`;
  }

  return `
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

function getStatusBadge(promo) {
  if (promo.refuse) {
    return '<span class="badge bg-danger">Refusé</span>';
  }
  if (promo.validé_par_admin) {
    return '<span class="badge bg-success">Validé</span>';
  }
  return '<span class="badge bg-warning">En attente</span>';
}

function displayPromos(promos) {
  const tbody = document.getElementById("pendingPromoList");
  if (!tbody) return;

  tbody.innerHTML = "";

  promos.forEach((promo) => {
    const row = document.createElement("tr");
    const status = getPromoStatus(promo); // Get the status
    row.setAttribute("data-status", status); // Set the status as data attribute

    row.innerHTML = `
            <td><span class="badge bg-secondary">${promo.code}</span></td>
            <td>
                <div>${promo.user_prenom || ""} ${promo.user_nom || ""}</div>
                <small class="text-muted">ID: #${
                  promo.vendeur_id || "N/A"
                }</small>
                <div>${getStatusBadge(promo)}</div>
            </td>
            <td>${promo.description || "Pas de description"}</td>
            <td>${formatReduction(promo)}</td>
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
                <div>Min: ${formatPrice(promo.condition_min)}</div>
                <div>Max: ${formatPrice(promo.montant_max)}</div>
            </td>
            <td class="table-actions">${getActionButtons(promo)}</td>
        `;
    tbody.appendChild(row);
  });

  // Apply current filter after displaying promos
  const activeFilter = document.querySelector(".btn-group .btn.active");
  if (activeFilter) {
    filterPromosByStatus(activeFilter.textContent.toLowerCase().trim());
  }
}

function showPromoDetails(id) {
  fetch(`../../public/index.php?api=promo&action=getPromoById&id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const promo = data.promo;
        const modalBody = document
          .getElementById("promoDetailModal")
          .querySelector(".modal-body");
        modalBody.innerHTML = `
          <div class="row">
            <div class="col-md-6">
              <h6>Informations générales</h6>
              <p><strong>Code:</strong> ${promo.code}</p>
              <p><strong>Nom:</strong> ${promo.nom_promo || "N/A"}</p>
              <p><strong>Description:</strong> ${promo.description || "N/A"}</p>
              <p><strong>Vendeur ID:</strong> #${promo.vendeur_id}</p>
            </div>
            <div class="col-md-6">
              <h6>Détails de la réduction</h6>
              <p><strong>Type:</strong> ${promo.type_reduction}</p>
              <p><strong>Valeur:</strong> ${formatReduction(promo)}</p>
              <p><strong>Minimum d'achat:</strong> ${formatPrice(
                promo.condition_min
              )}</p>
              <p><strong>Maximum réduction:</strong> ${formatPrice(
                promo.montant_max
              )}</p>
            </div>
            <div class="col-12">
              <h6>Période de validité</h6>
              <p><strong>Du:</strong> ${formatDate(
                promo.date_debut
              )} <strong>Au:</strong> ${formatDate(promo.date_fin)}</p>
              <p><strong>Durée:</strong> ${calculateDuration(
                promo.date_debut,
                promo.date_fin
              )} jours</p>
            </div>
          </div>
        `;

        // Stocker l'ID pour les actions
        document.getElementById("promoDetailModal").dataset.promoId = id;

        // Afficher/Masquer les boutons selon le statut
        const footer = document
          .getElementById("promoDetailModal")
          .querySelector(".modal-footer");
        footer.innerHTML = getModalFooterButtons(promo);

        // Afficher le modal
        new bootstrap.Modal(document.getElementById("promoDetailModal")).show();
      }
    })
    .catch((error) =>
      showAlert("Erreur lors du chargement des détails", "danger")
    );
}

// Utility functions (moved to top)
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("fr-FR");
}

function formatReduction(promo) {
  const value = promo.reduction_value;
  switch (promo.type_reduction) {
    case "pourcentage":
      return `${value}%`;
    case "montant":
      return `${value}€`;
    case "livraison gratuite":
      return "Livraison gratuite";
    default:
      return value;
  }
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function formatPrice(price) {
  if (!price) return "N/A";
  return `${parseFloat(price).toFixed(2)}€`;
}

function showAlert(message, type) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

function getPromoStatus(promo) {
  if (promo.refuse) return "refusé";
  if (promo.validé_par_admin) return "validé";
  return "en attente";
}

function filterPromosByStatus(status) {
  const promoRows = document.querySelectorAll("#pendingPromoList tr");

  promoRows.forEach((row) => {
    const promoStatus = row.getAttribute("data-status");

    if (status === "tous") {
      row.style.display = "";
    } else {
      switch (status) {
        case "en attente":
          row.style.display = promoStatus === "en attente" ? "" : "none";
          break;
        case "validés":
          row.style.display = promoStatus === "validé" ? "" : "none";
          break;
        case "refusés":
          row.style.display = promoStatus === "refusé" ? "" : "none";
          break;
      }
    }
  });
}
