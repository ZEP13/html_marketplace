document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.getElementById("footerContainer");

  if (footerContainer) {
    fetch("/html_marketplace/views/footer.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement du footer");
        }
        return response.text();
      })
      .then((html) => {
        // Extraire seulement la partie footer du HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const footerContent = doc.querySelector("footer");
        footerContainer.innerHTML = footerContent.outerHTML;
      })
      .catch((error) => {
        console.error("Erreur:", error);
        footerContainer.innerHTML = "<p>Erreur de chargement du footer</p>";
      });
  }
});
