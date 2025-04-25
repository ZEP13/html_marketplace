document.addEventListener("DOMContentLoaded", function () {
  loadPromos();
  initializeEventListeners();
});

function initializeEventListeners() {
  document
    .getElementById("createGlobalPromoForm")
    .addEventListener("submit", createPromo);
  document
    .getElementById("editGlobalPromoForm")
    .addEventListener("submit", editPromo);
  document
    .getElementById("type_reduction")
    .addEventListener("change", toggleMontantMax);
  document
    .getElementById("edit_type_reduction")
    .addEventListener("change", toggleEditMontantMax);

  // Filter buttons
  document
    .getElementById("filterAll")
    .addEventListener("click", () => filterPromos("all"));
  document
    .getElementById("filterActive")
    .addEventListener("click", () => filterPromos("active"));
  document
    .getElementById("filterExpired")
    .addEventListener("click", () => filterPromos("expired"));
}

function loadPromos() {
  fetch("../../public/index.php?api=promo&action=getPromo")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updatePromoTable(data.promos);
        updateStats(data.promos);
      }
    })
    .catch((error) =>
      showAlert("Erreur lors du chargement des promotions", "danger")
    );
}

function createPromo(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Add default values
  formData.append("actif", "1");
  formData.append("validé_par_admin", "1");
  formData.append("est_globale", "1");
  formData.append("nbreUtilisationCode", "0");
  formData.append("refuse", "0");
  formData.append("ajoute_par_admin", "1");

  // Convert empty strings to null for optional fields
  ["montant_max", "condition_min"].forEach((field) => {
    if (!formData.get(field)) {
      formData.set(field, "0");
    }
  });

  fetch("../../public/index.php?api=promo&action=createPromo", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        bootstrap.Modal.getInstance(
          document.getElementById("createPromoModal")
        ).hide();
        loadPromos();
        showAlert("Promotion créée avec succès", "success");
      } else {
        showAlert(result.error || "Erreur lors de la création", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors de la création", "danger"));
}

function editPromo(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  // Ajouter l'ID de la promo
  const promoId = document.getElementById("edit_promo_id").value;
  formData.append("id", promoId);

  // Ajouter les valeurs par défaut nécessaires
  formData.append("actif", "1");
  formData.append("validé_par_admin", "1");
  formData.append("est_globale", "1");

  fetch("../../public/index.php?api=promo&action=updatePromo", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        bootstrap.Modal.getInstance(
          document.getElementById("editPromoModal")
        ).hide();
        loadPromos();
        showAlert("Promotion mise à jour avec succès", "success");
      } else {
        showAlert(result.error || "Erreur lors de la mise à jour", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors de la mise à jour", "danger"));
}

function togglePromoStatus(id) {
  // Convertir en objet JSON avant l'envoi
  const data = new FormData();
  data.append("id", id);

  fetch("../../public/index.php?api=promo&action=setActive", {
    method: "POST",
    body: data,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        loadPromos();
        showAlert("Statut de la promotion modifié avec succès", "success");
      } else {
        showAlert(
          result.error || "Erreur lors du changement de statut",
          "danger"
        );
      }
    })
    .catch((error) =>
      showAlert("Erreur lors du changement de statut", "danger")
    );
}

function deletePromo(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return;

  const data = new FormData();
  data.append("id", id);

  fetch("../../public/index.php?api=promo&action=deletePromo", {
    method: "POST",
    body: data,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        loadPromos();
        showAlert("Promotion supprimée avec succès", "success");
      } else {
        showAlert(result.error || "Erreur lors de la suppression", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors de la suppression", "danger"));
}

function openEditModal(id) {
  fetch(`../../public/index.php?api=promo&action=getPromoById&id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const promo = data.promo;

        // Pré-remplir tous les champs du formulaire
        document.getElementById("edit_code").value = promo.code;
        document.getElementById("edit_nom_promo").value = promo.nom_promo;
        document.getElementById("edit_description").value = promo.description;
        document.getElementById("edit_date_debut").value = formatDateForInput(
          promo.date_debut
        );
        document.getElementById("edit_date_fin").value = formatDateForInput(
          promo.date_fin
        );
        document.getElementById("edit_reduction_value").value =
          promo.reduction_value;
        document.getElementById("edit_type_reduction").value =
          promo.type_reduction;
        document.getElementById("edit_condition_min").value =
          promo.condition_min;
        document.getElementById("edit_montant_max").value = promo.montant_max;
        document.getElementById("edit_promo_id").value = promo.id;

        // Mettre à jour l'affichage du champ montant_max en fonction du type de réduction
        toggleEditMontantMax();

        // Ouvrir le modal
        new bootstrap.Modal(document.getElementById("editPromoModal")).show();
      }
    })
    .catch((error) =>
      showAlert("Erreur lors du chargement de la promotion", "danger")
    );
}

// Ajouter cette fonction utilitaire pour formater les dates
function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// Utility functions
function updatePromoTable(promos) {
  const tbody = document.getElementById("promoList");
  tbody.innerHTML = "";

  // Filter to show only admin-created promos
  const adminPromos = promos.filter((promo) => promo.ajoute_par_admin == 1);

  adminPromos.forEach((promo) => {
    const row = document.createElement("tr");
    row.dataset.promoId = promo.id;

    row.innerHTML = `
            <td>${promo.code}</td>
            <td>${promo.nom_promo}</td>
            <td>${promo.type_reduction}</td>
            <td>${promo.reduction_value}${
      promo.type_reduction === "pourcentage" ? "%" : "€"
    }</td>
            <td>${formatDate(promo.date_debut)} - ${formatDate(
      promo.date_fin
    )}</td>
            <td>${promo.nbreUtilisationCode}</td>
            <td><span class="badge bg-${
              promo.actif == 1 ? "success" : "danger"
            }">${promo.actif == 1 ? "Actif" : "Inactif"}</span></td>
            <td>
                <button class="btn btn-sm btn-info action-btn" onclick="openEditModal(${
                  promo.id
                })">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-${
                  promo.actif == 1 ? "warning" : "success"
                } action-btn" 
                        onclick="togglePromoStatus(${promo.id})">
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="btn btn-sm btn-danger action-btn" onclick="deletePromo(${
                  promo.id
                })">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function updateStats(promos) {
  const now = new Date();
  const activePromos = promos.filter((p) => p.actif == 1);
  const expiringSoon = promos.filter((p) => {
    const endDate = new Date(p.date_fin);
    const daysUntilExpiry = Math.floor((endDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  });

  const totalUsage = promos.reduce(
    (sum, p) => sum + parseInt(p.nbreUtilisationCode),
    0
  );
  const avgDiscount =
    activePromos.reduce((sum, p) => sum + parseFloat(p.reduction_value), 0) /
    activePromos.length;

  document.getElementById("totalPromos").textContent = activePromos.length;
  document.getElementById("totalUsage").textContent = totalUsage;
  document.getElementById("expiringSoon").textContent = expiringSoon.length;
  document.getElementById("avgDiscount").textContent = `${avgDiscount.toFixed(
    1
  )}%`;
}

function filterPromos(type) {
  const rows = document.querySelectorAll("#promoList tr");
  rows.forEach((row) => {
    const status = row.querySelector(".badge").textContent;
    if (
      type === "all" ||
      (type === "active" && status === "Actif") ||
      (type === "expired" && status === "Inactif")
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function showAlert(message, type) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("fr-FR");
}

function toggleMontantMax() {
  const typeReduction = document.getElementById("type_reduction").value;
  const montantMaxContainer = document.getElementById("montantMaxContainer");
  montantMaxContainer.style.display =
    typeReduction === "montant" ? "none" : "block";
}

function toggleEditMontantMax() {
  const typeReduction = document.getElementById("edit_type_reduction").value;
  const montantMaxContainer = document.getElementById(
    "edit_montantMaxContainer"
  );
  montantMaxContainer.style.display =
    typeReduction === "montant" ? "none" : "block";
}
