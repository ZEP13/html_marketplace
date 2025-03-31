document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=commande&action=getCommandeByUser", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data && data.commande && data.commande.length > 0) {
        const tableBody = document.querySelector("tbody");
        tableBody.innerHTML = "";

        data.commande.forEach((commande) => {
          const row = document.createElement("tr");
          const commandeDate = new Date(commande.date_commande);
          const options = { day: "2-digit", month: "long", year: "numeric" };
          const formattedDate = commandeDate.toLocaleDateString(
            "fr-FR",
            options
          );

          // Define the row element
          row.innerHTML = `
            <td>${commande.id_commande}</td>
            <td>${formattedDate}</td>
            <td>${
              commande.statut || "Non spécifié"
            }</td> <!-- Fallback for empty statut -->
            <td>€${commande.price}</td>
            <td class="td_btn">
              <button class="btn btn-primary btn-sm">Voir</button>
            </td>
          `;
          tableBody.appendChild(row); // Append the row to the table body
        });
      } else {
        console.log("aucune commande trouve");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des commandes:", error);
    });
});
