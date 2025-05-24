document.addEventListener("DOMContentLoaded", function () {
  loadVendorStats();
});

function loadVendorStats() {
  // Récupérer les produits du vendeur
  fetch("../public/index.php?api=produit&action=getProduitsByUser")
    .then((response) => response.json())
    .then((produitsData) => {
      if (Array.isArray(produitsData)) {
        document.getElementById("totalProduits").textContent =
          produitsData.length;
        return fetch("../public/index.php?api=user&action=getVentesUser");
      }
      return Promise.reject("Aucun produit trouvé");
    })
    .then((response) => response.json())
    .then((ventesData) => {
      if (ventesData.success) {
        document.getElementById("totalVentes").textContent = ventesData.ventes;
      }
      // Récupérer les deux types de stats de promos
      return Promise.all([
        fetch("../public/index.php?api=promo&action=getUserPromos"),
        fetch("../public/index.php?api=user&action=promoStat"),
      ]);
    })
    .then(([promosResponse, promoStatsResponse]) =>
      Promise.all([promosResponse.json(), promoStatsResponse.json()])
    )
    .then(([promosData, promoStats]) => {
      // Mettre à jour le nombre de promos actives
      if (promosData.success) {
        const promosActives = promosData.promos.filter(
          (p) => p.actif === 1
        ).length;
        document.getElementById("promosActives").textContent = promosActives;
      }
      // Mettre à jour le nombre total d'utilisations
      if (promoStats.success) {
        document.getElementById("totalUtilisations").textContent =
          promoStats.promoStat;
      }
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des statistiques:", error);
      showError("Une erreur est survenue lors du chargement des statistiques");
    });
}

function showError(message) {
  const container = document.querySelector(".container");
  const alert = document.createElement("div");
  alert.className = "alert alert-danger";
  alert.textContent = message;
  container.insertBefore(alert, container.firstChild);
}
