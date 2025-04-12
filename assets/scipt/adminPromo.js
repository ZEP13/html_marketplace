document.addEventListener("DOMContentLoaded", function () {
  loadStats();
  loadAllPromos();

  // Event Listeners pour les filtres
  document
    .getElementById("filterAll")
    .addEventListener("click", () => filterPromos("all"));
  document
    .getElementById("filterActive")
    .addEventListener("click", () => filterPromos("active"));
  document
    .getElementById("filterExpired")
    .addEventListener("click", () => filterPromos("expired"));

  // Event Listener pour le formulaire de création
  document
    .getElementById("createGlobalPromoForm")
    .addEventListener("submit", handleCreatePromo);

  // Ajouter/Modifier l'écouteur d'événements pour le type de réduction
  document
    .getElementById("type_reduction")
    .addEventListener("change", function () {
      const montantMaxContainer = document.getElementById(
        "montantMaxContainer"
      );
      const montantMaxInput = document.getElementById("montant_max");

      if (this.value === "montant") {
        montantMaxContainer.style.display = "none";
        montantMaxInput.value = "";
        montantMaxInput.removeAttribute("required");
      } else {
        montantMaxContainer.style.display = "block";
        montantMaxInput.setAttribute("required", "required");
      }
    });

  // Ajouter un écouteur pour les champs de date
  const dateDebut = document.getElementById("date_debut");
  const dateFin = document.getElementById("date_fin");

  // Définir la date minimale à aujourd'hui
  const today = new Date().toISOString().split("T")[0];
  dateDebut.setAttribute("min", today);
  dateFin.setAttribute("min", today);

  // Valider les dates lors de la soumission
  document
    .getElementById("createGlobalPromoForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const startDate = new Date(dateDebut.value);
      const endDate = new Date(dateFin.value);
      const now = new Date();

      if (startDate < now.setHours(0, 0, 0, 0)) {
        alert("La date de début doit être égale ou postérieure à aujourd'hui");
        return;
      }

      if (endDate < startDate) {
        alert("La date de fin doit être postérieure à la date de début");
        return;
      }

      // Continuer avec la soumission du formulaire
      await handleCreatePromo(event);
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
      document.getElementById("totalPromos").textContent = promos.filter(
        (p) => p.actif
      ).length;
      document.getElementById("totalUsage").textContent =
        calculateTotalUsage(promos);
      document.getElementById("expiringSoon").textContent =
        getExpiringSoonCount(promos);
      document.getElementById("avgDiscount").textContent =
        calculateAverageDiscount(promos) + "%";
    }
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
  }
}

async function loadAllPromos() {
  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=getPromo"
    );
    const data = await response.json();
    if (data.success) {
      displayPromos(data.promos);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des promotions:", error);
  }
}

function displayPromos(promos) {
  const tbody = document.getElementById("promoList");
  tbody.innerHTML = "";

  promos.forEach((promo) => {
    const isExpired = new Date(promo.date_fin) < new Date();
    const statusClass = isExpired
      ? "bg-secondary"
      : promo.actif
      ? "bg-success"
      : "bg-danger";
    const statusText = isExpired ? "Expiré" : promo.actif ? "Actif" : "Inactif";

    const row = `
        <tr data-status="${promo.etat_actuel}">
            <td>${promo.code}</td>
            <td>${promo.nom_promo}</td>
            <td>${promo.type_reduction}</td>
            <td>${promo.reduction_value}${
      promo.type_reduction === "pourcentage" ? "%" : "€"
    }</td>
            <td>
                <div>${formatDate(promo.date_debut)} - ${formatDate(
      promo.date_fin
    )}</div>
                <small class="text-muted">${
                  isExpired ? "Expiré" : getDaysLeft(promo.date_fin)
                } jours restants</small>
            </td>
            <td>${promo.nbreUtilisationCode || 0}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td class="table-actions">
                ${getActionButtons(promo)}
            </td>
        </tr>
    `;
    tbody.innerHTML += row;
  });
}

function getActionButtons(promo) {
  const isExpired = new Date(promo.date_fin) < new Date();
  if (isExpired) {
    return `
        <button class="btn btn-sm btn-info action-btn" onclick="showPromoDetails(${promo.id})">
            <i class="fas fa-eye"></i>
        </button>`;
  }

  return `
      <button class="btn btn-sm btn-info action-btn" onclick="editPromo(${
        promo.id
      })">
          <i class="fas fa-edit"></i>
      </button>
      ${
        promo.actif
          ? `<button class="btn btn-sm btn-warning action-btn" onclick="togglePromoStatus(${promo.id}, false)">
              <i class="fas fa-power-off"></i>
          </button>`
          : `<button class="btn btn-sm btn-success action-btn" onclick="togglePromoStatus(${promo.id}, true)">
              <i class="fas fa-power-off"></i>
          </button>`
      }
      <button class="btn btn-sm btn-danger action-btn" onclick="deletePromo(${
        promo.id
      })">
          <i class="fas fa-trash"></i>
      </button>`;
}

function getDaysLeft(endDate) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function handleCreatePromo(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const promoData = {};

  formData.forEach((value, key) => {
    promoData[key] = value;
  });

  promoData.est_globale = true;

  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=addPromo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promoData),
        credentials: "include", // Important pour envoyer les cookies de session
      }
    );

    const data = await response.json();

    if (response.status === 403) {
      alert(
        "Accès non autorisé. Veuillez vous connecter en tant qu'administrateur."
      );
      window.location.href = "../login.html";
      return;
    }

    if (data.success) {
      alert("Promotion créée avec succès");
      bootstrap.Modal.getInstance(
        document.getElementById("createPromoModal")
      ).hide();
      form.reset();
      loadAllPromos();
      loadStats();
    } else {
      alert(data.message || "Erreur lors de la création de la promotion");
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la création de la promotion");
  }
}

async function editPromo(id) {
  try {
    const response = await fetch(
      `../../public/index.php?api=promo&action=getPromoById&id=${id}`
    );
    const data = await response.json();

    if (data.success) {
      // Remplir le formulaire de modification
      const modal = new bootstrap.Modal(
        document.getElementById("createPromoModal")
      );
      const form = document.getElementById("createGlobalPromoForm");

      // Remplir les champs du formulaire
      form.code.value = data.promo.code;
      form.nom_promo.value = data.promo.nom_promo;
      form.description.value = data.promo.description;
      form.date_debut.value = data.promo.date_debut;
      form.date_fin.value = data.promo.date_fin;
      form.reduction_value.value = data.promo.reduction_value;
      form.type_reduction.value = data.promo.type_reduction;
      form.condition_min.value = data.promo.condition_min || "";

      // Gérer l'affichage du champ montant_max selon le type de réduction
      const montantMaxContainer = document.getElementById(
        "montantMaxContainer"
      );
      if (data.promo.type_reduction === "montant") {
        montantMaxContainer.style.display = "none";
        form.montant_max.value = "";
        form.montant_max.removeAttribute("required");
      } else {
        montantMaxContainer.style.display = "block";
        form.montant_max.value = data.promo.montant_max || "";
        form.montant_max.setAttribute("required", "required");
      }

      // Ajouter l'ID de la promo au formulaire
      form.dataset.promoId = id;

      modal.show();
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la récupération des détails de la promotion");
  }
}

async function togglePromoStatus(id, newStatus) {
  if (
    !confirm(
      `Êtes-vous sûr de vouloir ${
        newStatus ? "activer" : "désactiver"
      } cette promotion ?`
    )
  )
    return;

  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=setActive",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_promo: id,
          active: newStatus,
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      alert(`Promotion ${newStatus ? "activée" : "désactivée"} avec succès`);
      loadAllPromos();
      loadStats();
    } else {
      alert(data.message || "Erreur lors de la modification du statut");
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la modification du statut");
  }
}

async function deletePromo(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return;

  try {
    const response = await fetch(
      "../../public/index.php?api=promo&action=deletePromo",
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
      alert("Promotion supprimée avec succès");
      loadAllPromos();
      loadStats();
    } else {
      alert(data.message || "Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la suppression de la promotion");
  }
}

// Fonctions utilitaires
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function calculateTotalUsage(promos) {
  return promos.reduce(
    (total, promo) => total + (promo.nbreUtilisationCode || 0),
    0
  );
}

function getExpiringSoonCount(promos) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();
  return promos.filter((promo) => {
    const endDate = new Date(promo.date_fin);
    return endDate - now <= oneWeek && endDate > now;
  }).length;
}

function calculateAverageDiscount(promos) {
  const percentagePromos = promos.filter(
    (p) => p.type_reduction === "percentage"
  );
  if (percentagePromos.length === 0) return 0;
  const total = percentagePromos.reduce(
    (sum, p) => sum + parseFloat(p.reduction_value),
    0
  );
  return Math.round(total / percentagePromos.length);
}

function filterPromos(filter) {
  const promoList = document.getElementById("promoList");
  const rows = promoList.getElementsByTagName("tr");

  for (let row of rows) {
    const statusBadge = row.querySelector(".badge");
    if (!statusBadge) continue;

    const status = row.getAttribute("data-status");
    switch (filter) {
      case "all":
        row.style.display = "";
        break;
      case "active":
        row.style.display = status === "actif" ? "" : "none";
        break;
      case "expired":
        row.style.display = status === "expiré" ? "" : "none";
        break;
    }
  }

  // Mettre à jour l'état actif des boutons de filtre
  document.querySelectorAll(".filter-section button").forEach((button) => {
    button.classList.remove("active");
    if (button.id.toLowerCase().includes(filter)) {
      button.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const typeReductionSelect = document.getElementById("type_reduction");
  const montantMaxContainer = document.getElementById("montantMaxContainer");
  const montantMaxInput = document.getElementById("montant_max");

  typeReductionSelect.addEventListener("change", function () {
    if (this.value === "montant") {
      montantMaxContainer.style.display = "none";
      montantMaxInput.value = "";
      montantMaxInput.removeAttribute("required");
    } else {
      montantMaxContainer.style.display = "block";
      montantMaxInput.setAttribute("required", "required");
    }
  });
});
