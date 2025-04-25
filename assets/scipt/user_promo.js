document.addEventListener("DOMContentLoaded", function () {
  loadUserPromos();
  document
    .getElementById("createPromoForm")
    .addEventListener("submit", createPromo);

  // Add type_reduction change event listener
  document
    .getElementById("type_reduction")
    .addEventListener("change", toggleMontantMax);
});

function toggleMontantMax() {
  const typeReduction = document.getElementById("type_reduction").value;
  const montantMaxField = document.getElementById("montant_max");
  const montantMaxContainer = document.getElementById("montantMaxContainer");

  if (typeReduction === "montant" || typeReduction === "livraison gratuite") {
    montantMaxContainer.style.display = "none";
    montantMaxField.value = "";
    montantMaxField.removeAttribute("required");
  } else {
    montantMaxContainer.style.display = "block";
    montantMaxField.setAttribute("required", "required");
  }
}

function loadUserPromos() {
  fetch("../public/index.php?api=promo&action=getUserPromos") // Fixed path
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayPromos(data.promos);
      }
    })
    .catch((error) =>
      showAlert("Erreur lors du chargement des promotions", "danger")
    );
}

function updatePromo(e, id) {
  e.preventDefault();
  const formData = new FormData();
  formData.append("id", id);

  const fields = [
    "code",
    "nom_promo",
    "description",
    "date_debut",
    "date_fin",
    "reduction_value",
    "type_reduction",
    "condition_min",
    "montant_max",
  ];

  fields.forEach((field) => {
    formData.append(field, document.getElementById(field).value);
  });

  // Ajout des champs manquants
  formData.append(
    "vendeur_id",
    document.getElementById("vendeur_id")?.value || ""
  );
  formData.append("est_globale", "0");
  formData.append("actif", "0");
  formData.append("validé_par_admin", "0");

  fetch(`../public/index.php?api=promo&action=updateUserPromo&id=${id}`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        showAlert("Promotion mise à jour avec succès", "success");
        loadUserPromos();
        resetForm();
      } else {
        showAlert(result.error || "Erreur lors de la mise à jour", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors de la mise à jour", "danger"));
}

function createPromo(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const isEditing =
    document.getElementById("createPromoForm").dataset.editMode === "true";
  const promoId = document.getElementById("createPromoForm").dataset.promoId;

  const typeReduction = document.getElementById("type_reduction").value;
  if (typeReduction === "montant" || typeReduction === "livraison gratuite") {
    formData.delete("montant_max"); // Remove montant_max for these types
  }

  const fields = [
    "code",
    "nom_promo",
    "description",
    "date_debut",
    "date_fin",
    "reduction_value",
    "type_reduction",
    "condition_min",
    "montant_max",
  ];

  fields.forEach((field) => {
    formData.append(field, document.getElementById(field).value);
  });

  const url = isEditing
    ? `../public/index.php?api=promo&action=updateUserPromo&id=${promoId}`
    : "../public/index.php?api=promo&action=createUserPromo";

  fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        showAlert(
          isEditing
            ? "Promotion mise à jour avec succès"
            : "Promotion créée avec succès",
          "success"
        );
        loadUserPromos();
        resetForm();
      } else {
        showAlert(result.error || "Erreur lors de l'opération", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors de l'opération", "danger"));
}

function displayPromos(promos) {
  const container = document.getElementById("promoList");
  container.innerHTML = "";

  promos.forEach((promo) => {
    const card = document.createElement("div");
    card.className = "col-md-6 mb-4";
    card.innerHTML = `
            <div class="promo-card position-relative">
                <span class="status-badge badge bg-${
                  promo.actif ? "success" : "danger"
                }">
                    ${promo.actif ? "Actif" : "Inactif"}
                </span>
                <h3 class="h5">${promo.code}</h3>
                <p class="text-muted">${
                  promo.description || "Aucune description"
                }</p>
                <div class="row mb-3">
                    <div class="col-4">
                        <small class="text-muted">Valeur: ${formatReduction(
                          promo
                        )}</small>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">Min. achat: ${
                          promo.condition_min
                        }€</small>
                    </div>
                    <div class="col-4">
                        <small class="text-muted">Utilisations: ${
                          promo.nbreUtilisationCode
                        }</small>
                    </div>
                </div>
                <div class="action-buttons">
                    ${getActionButtons(promo)}
                </div>
            </div>
        `;
    container.appendChild(card);
  });
}

function togglePromo(id) {
  if (!confirm("Voulez-vous changer le statut de cette promotion ?")) {
    return;
  }

  const formData = new FormData();
  formData.append("id", id);

  fetch("../public/index.php?api=promo&action=setActive", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        showAlert("Statut de la promotion modifié avec succès", "success");
        loadUserPromos();
      } else {
        showAlert(
          result.error || "Erreur lors de la modification du statut",
          "danger"
        );
      }
    })
    .catch((error) =>
      showAlert("Erreur lors de la modification du statut", "danger")
    );
}

function deletePromo(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) {
    return;
  }

  const formData = new FormData();
  formData.append("id", id);

  fetch("../public/index.php?api=promo&action=deletePromo", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        showAlert("Promotion supprimée avec succès", "success");
        loadUserPromos();
      } else {
        showAlert(result.error || "Erreur lors de la suppression", "danger");
      }
    })
    .catch((error) => showAlert("Erreur lors de la suppression", "danger"));
}

function getActionButtons(promo) {
  return `
    <button class="btn btn-sm btn-warning" onclick="editPromo(${promo.id})">
      <i class="fas fa-edit"></i> Modifier
    </button>
    <button class="btn btn-sm btn-danger" onclick="deletePromo(${promo.id})">
      <i class="fas fa-trash"></i> Supprimer
    </button>
    <button class="btn btn-sm btn-${promo.actif ? "success" : "secondary"}" 
            onclick="togglePromo(${promo.id})" ${
    !promo.validé_par_admin ? "disabled" : ""
  }>
      <i class="fas fa-power-off"></i> ${promo.actif ? "Désactiver" : "Activer"}
    </button>
  `;
}

function editPromo(id) {
  fetch(`../public/index.php?api=promo&action=getPromoById&id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const form = document.getElementById("createPromoForm");
        form.dataset.editMode = "true";
        form.dataset.promoId = id;

        // Update form title
        document.querySelector(".card-header h2").textContent =
          "Modifier la promotion";

        // Fill all form fields
        const fields = [
          "code",
          "nom_promo",
          "description",
          "date_debut",
          "date_fin",
          "reduction_value",
          "type_reduction",
          "condition_min",
          "montant_max",
        ];

        fields.forEach((field) => {
          const input = document.getElementById(field);
          if (input) {
            input.value = data.promo[field] || "";
          }
        });

        // Update buttons
        const submitBtn = form.querySelector('button[type="submit"]');
        const cancelBtn = form.querySelector('button[onclick="resetForm()"]');
        submitBtn.textContent = "Mettre à jour la promotion";
        cancelBtn.style.display = "inline-block";

        // Scroll to form
        form.scrollIntoView({ behavior: "smooth" });
      }
    })
    .catch((error) =>
      showAlert("Erreur lors du chargement de la promotion", "danger")
    );
}

function resetForm() {
  const form = document.getElementById("createPromoForm");
  form.reset();
  form.dataset.editMode = "false";
  form.dataset.promoId = "";

  // Reset form title
  document.querySelector(".card-header h2").textContent =
    "Créer un nouveau code promo";

  // Reset buttons
  const submitBtn = form.querySelector('button[type="submit"]');
  const cancelBtn = form.querySelector('button[onclick="resetForm()"]');
  submitBtn.textContent = "Créer la promotion";
  cancelBtn.style.display = "none";
}

// Utility functions
function formatReduction(promo) {
  return promo.type_reduction === "pourcentage"
    ? `${promo.reduction_value}%`
    : `${promo.reduction_value}€`;
}

function showAlert(message, type) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.innerHTML = `${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}
