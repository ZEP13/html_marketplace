let droppedFiles = []; // Move to global scope
let gallery; // Move to global scope

document.addEventListener("DOMContentLoaded", function () {
  fetch("../public/index.php?api=category&action=getAllCategories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse du serveur:", data);

      const selecte = document.getElementById("selectCategory");

      // Check if the response is successful and contains categories
      if (!data.success || !Array.isArray(data.categories)) {
        console.error(
          "Erreur : La réponse ne contient pas de catégories :",
          data
        );
        selecte.innerHTML =
          '<option value="">Erreur lors de la récupération des catégories</option>';
        return;
      }

      if (data.categories.length === 0) {
        selecte.innerHTML =
          '<option value="">Aucune catégorie disponible</option>';
        return;
      }

      // Populate the select element with categories
      data.categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.category_name;
        selecte.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la requête :", error);
      const selecte = document.getElementById("selectCategory");
      selecte.innerHTML =
        '<option value="">Erreur lors de la récupération des catégories</option>';
    });

  const dropBox = document.getElementById("dropBox");
  const fileInput = document.getElementById("images");
  gallery = document.getElementById("gallery"); // Assign to global variable

  // Prevent default behavior for drag-and-drop events
  ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
    dropBox.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Highlight dropBox on dragover
  ["dragenter", "dragover"].forEach((evt) => {
    dropBox.addEventListener(evt, () => dropBox.classList.add("hover"));
  });

  // Remove highlight on dragleave or drop
  ["dragleave", "drop"].forEach((evt) => {
    dropBox.addEventListener(evt, () => dropBox.classList.remove("hover"));
  });

  // Handle file drop
  dropBox.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  });

  // Handle file selection via input
  dropBox.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  });

  function handleFiles(files) {
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        droppedFiles.push(file); // Add file to the array
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgWrapper = document.createElement("div");
          imgWrapper.classList.add("position-relative", "m-2");

          const img = document.createElement("img");
          img.src = e.target.result;
          img.classList.add("img-thumbnail");
          img.style.width = "100px";
          img.style.height = "100px";

          const removeBtn = document.createElement("button");
          removeBtn.classList.add(
            "btn",
            "btn-primary",
            "btn-sm",
            "position-absolute",
            "top-0",
            "end-0",
            "p-0",
            "d-flex",
            "justify-content-center"
          );
          removeBtn.style.width = "20px";
          removeBtn.style.height = "20px";
          removeBtn.style.borderRadius = "50%";
          removeBtn.style.lineHeight = "15px";
          removeBtn.style.fontSize = "14px"; // Adjust font size for better centering
          removeBtn.innerHTML = "&times;";
          removeBtn.addEventListener("click", () =>
            removeImage(file, imgWrapper)
          );

          imgWrapper.appendChild(img);
          imgWrapper.appendChild(removeBtn);
          gallery.appendChild(imgWrapper);
        };
        reader.readAsDataURL(file);
      }
    });

    updateFileInput();
  }

  function removeImage(file, imgWrapper) {
    // Remove the file from the droppedFiles array
    droppedFiles = droppedFiles.filter((f) => f !== file);

    // Remove the image wrapper from the gallery
    imgWrapper.remove();

    // Update the file input
    updateFileInput();
  }

  function updateFileInput() {
    const dataTransfer = new DataTransfer();
    droppedFiles.forEach((file) => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
  }
});

document
  .getElementById("addProduitForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const alertContainer = document.getElementById("alertContainerAdd");
    const formData = new FormData();

    // Collect product data
    formData.append("nom", document.getElementById("productName").value);
    formData.append(
      "description",
      document.getElementById("productDescription").value
    );
    formData.append("prix", document.getElementById("productPrice").value);
    formData.append(
      "quantite",
      document.getElementById("productQuantite").value
    );
    formData.append(
      "category",
      document.getElementById("selectCategory").value
    );
    formData.append("img", document.getElementById("productImage").files[0]);
    formData.append(
      "actif",
      document.getElementById("actifProduit").checked ? "1" : "0"
    );

    fetch("../public/index.php?api=produit&action=addProduit", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => Promise.reject(err));
        }
        return response.json();
      })
      .then((data) => {
        console.log("Réponse du serveur:", data);
        if (data.success) {
          alertContainer.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
          const productId = data.productId; // Assume backend returns the product ID

          // Call the addImages function to upload multiple images
          addImages(productId);
        } else {
          alertContainer.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
      })
      .catch((error) => {
        console.error("Erreur détaillée:", error);
        alertContainer.innerHTML = `<div class="alert alert-danger">Erreur lors de l'ajout du produit</div>`;
      });
  });

function addImages(productId) {
  const alertContainer = document.getElementById("alertContainerAdd");
  const formData = new FormData();

  formData.append("productId", productId);

  // Get all files from droppedFiles array
  if (droppedFiles.length === 0) {
    console.log("No additional images to upload");
    return;
  }

  console.log("Number of files to upload:", droppedFiles.length);

  // Append each image to formData with the correct name format
  droppedFiles.forEach((file, index) => {
    formData.append(`images[${index}]`, file);
    console.log(`Adding file ${index}:`, file.name);
  });

  // Debug log
  console.log("Sending images:", droppedFiles);

  fetch("../public/index.php?api=produit&action=addImages", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Server response:", data);
      if (data.success) {
        alertContainer.innerHTML += `<div class="alert alert-success">${data.message}</div>`;
        // Clear the gallery and droppedFiles after successful upload
        gallery.innerHTML = "";
        droppedFiles = [];
      } else {
        alertContainer.innerHTML += `<div class="alert alert-danger">Erreur lors de l'ajout des images secondaires</div>`;
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alertContainer.innerHTML += `<div class="alert alert-danger">Erreur lors de l'ajout des images secondaires</div>`;
    });
}
