function initializeNavbar() {
  fetch("../views/navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navContainer").innerHTML = data;

      // Load search.js dynamically if not already loaded
      if (!window.SearchManager) {
        const searchScript = document.createElement("script");
        searchScript.src = "../assets/scipt/search.js";
        searchScript.onload = () => {
          window.searchManager = new SearchManager();
          window.searchManager.init();
        };
        document.head.appendChild(searchScript);
      } else if (window.searchManager) {
        window.searchManager.init();
      }

      // Initialize other components
      const offcanvasElements = document.querySelectorAll(".offcanvas");
      offcanvasElements.forEach((element) => new bootstrap.Offcanvas(element));

      if (typeof initializePanier === "function") {
        setTimeout(initializePanier, 100);
      }
    })
    .catch((error) => console.error("Error loading navbar:", error));
}

document.addEventListener("DOMContentLoaded", initializeNavbar);
