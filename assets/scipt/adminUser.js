let currentSort = { field: "id", direction: "asc" };

document.addEventListener("DOMContentLoaded", function () {
  loadUsers();

  // Ajout des écouteurs pour le tri
  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", function () {
      const field = this.dataset.sort;
      currentSort.direction =
        currentSort.field === field && currentSort.direction === "asc"
          ? "desc"
          : "asc";
      currentSort.field = field;
      loadUsers();
    });
  });
});

function loadUsers() {
  fetch("../../public/index.php?api=user&action=getAllUsers")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateStatistics(data.users);
        displayUsers(data.users);
      } else {
        console.error(
          "Erreur lors du chargement des utilisateurs:",
          data.message
        );
      }
    })
    .catch((error) => console.error("Erreur:", error));
}

function updateStatistics(users) {
  const totalUsers = users.length;
  const activeVendors = users.filter((user) => user.role === "Vendeur").length;
  const activeAdmins = users.filter((user) => user.role === "Admin").length;

  document.getElementById("totalUsers").textContent = totalUsers;
  document.getElementById("activeVendors").textContent = activeVendors;
  document.getElementById("activeAdmins").textContent = activeAdmins;
}

function displayUsers(users) {
  // Tri des utilisateurs
  users.sort((a, b) => {
    const aValue = a[currentSort.field];
    const bValue = b[currentSort.field];
    return currentSort.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");
    const isChatBanned = user.chat_ban == 1;
    const isTotalBanned = user.is_banned == 1;

    tr.innerHTML = `
            <td>#${user.id_user}</td>
            <td>${user.user_nom} ${user.user_prenom}</td>
            <td>${user.user_mail}</td>
            <td>${user.role || "Acheteur"}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-warning dropdown-toggle" data-bs-toggle="dropdown">
                        Changer Rôle
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="changeRole(${
                          user.id_user
                        }, 'Acheteur')">Acheteur</a></li>
                        <li><a class="dropdown-item" href="#" onclick="changeRole(${
                          user.id_user
                        }, 'Vendeur')">Vendeur</a></li>
                        <li><a class="dropdown-item" href="#" onclick="changeRole(${
                          user.id_user
                        }, 'Admin')">Admin</a></li>
                    </ul>
                </div>
                <div class="btn-group ms-2">
                    <button class="btn btn-sm ${
                      isChatBanned || isTotalBanned
                        ? "btn-success"
                        : "btn-danger"
                    } dropdown-toggle" data-bs-toggle="dropdown">
                        ${isTotalBanned ? "Débannir" : "Bannir"}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="banUser(${
                          user.id_user
                        }, 'chat')">
                            ${
                              isChatBanned
                                ? "Débannir du chat"
                                : "Bannir du chat"
                            }
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="banUser(${
                          user.id_user
                        }, 'total')">
                            ${
                              isTotalBanned
                                ? "Débannir totalement"
                                : "Bannir totalement"
                            }
                        </a></li>
                    </ul>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Modifier la fonction changeRole pour accepter directement le nouveau rôle
function changeRole(userId, newRole) {
  fetch("../../public/index.php?api=user&action=changeRole", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      role: newRole,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadUsers();
      } else {
        alert("Erreur lors du changement de rôle");
      }
    })
    .catch((error) => console.error("Erreur:", error));
}

function banUser(userId, type) {
  const user = document.querySelector(`tr[data-user-id="${userId}"]`);
  const isChatBanned =
    type === "chat"
      ? user
          ?.querySelector(".btn-group:last-child button")
          .classList.contains("btn-success")
      : false;
  const isTotalBanned =
    type === "total"
      ? user
          ?.querySelector(".btn-group:last-child button")
          .classList.contains("btn-success")
      : false;

  const confirmMessage =
    type === "chat"
      ? isChatBanned
        ? "Voulez-vous débannir cet utilisateur du chat ?"
        : "Êtes-vous sûr de vouloir bannir cet utilisateur du chat ?"
      : isTotalBanned
      ? "Voulez-vous débannir totalement cet utilisateur ?"
      : "Êtes-vous sûr de vouloir bannir totalement cet utilisateur ?";

  if (confirm(confirmMessage)) {
    fetch("../public/index.php?api=user&action=banUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        banType: type,
        value: type === "chat" ? !isChatBanned : !isTotalBanned,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadUsers();
        } else {
          alert("Erreur lors du changement de statut de bannissement");
        }
      })
      .catch((error) => console.error("Erreur:", error));
  }
}
