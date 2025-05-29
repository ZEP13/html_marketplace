document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=user&action=getSession")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        return;
      } else {
        window.location.href = "../views/login.html";
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des logs:", error);
      window.location.href = "../views/login.html";
    });
});
