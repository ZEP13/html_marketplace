// js pour login style
const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

function togglePassword(passwordId, iconId) {
  var passwordField = document.getElementById(passwordId);
  var showPasswordIcon = document.getElementById(iconId);

  // Si le type est "password", changer en "text", sinon en "password"
  if (passwordField.type === "password") {
    passwordField.type = "text";
    showPasswordIcon.classList.remove("bxs-lock-alt");
    showPasswordIcon.classList.add("bxs-lock-open-alt");
  } else {
    passwordField.type = "password";
    showPasswordIcon.classList.remove("bxs-lock-open-alt");
    showPasswordIcon.classList.add("bxs-lock-alt");
  }
}
