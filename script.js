const shoppingList = document.querySelector(".shopping-list");
const shoppingForm = document.querySelector(".shopping-form");
const filterButtons = document.querySelectorAll(".filter-buttons button");
const clearBtn = document.querySelector(".clear");
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

document.addEventListener("DOMContentLoaded", function () {
  loadItems();

  updateState();

  shoppingForm.addEventListener("submit", handleFormSubmit);

  for (let button of filterButtons) {
    button.addEventListener("click", handleFilterSelection);
  }

  clearBtn.addEventListener("click", clear);

  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
});

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  themeToggle.style.transform = 'scale(0.8) rotate(180deg)';
  setTimeout(() => {
    themeToggle.style.transform = 'scale(1) rotate(360deg)';
  }, 200);
});

function saveToLS() {
  const listItem = shoppingList.querySelectorAll("li");
  const liste = [];

  for (let li of listItem) {
    const id = li.getAttribute("item-id");
    const name = li.querySelector(".item-name").textContent;
    const completed = li.hasAttribute("item-completed");

    liste.push({ id, name, completed });
  }

  localStorage.setItem("shoppingItems", JSON.stringify(liste));
}

function loadItems() {
  const items = JSON.parse(localStorage.getItem("shoppingItems")) || [];

  shoppingList.innerHTML = "";

  for (let item of items) {
    const li = creatListItem(item);
    shoppingList.appendChild(li);
  }
}

function creatListItem(item) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.classList.add("form-check-input");
  input.checked = item.completed;
  input.addEventListener("change", toggleCompleted);

  const div = document.createElement("div");
  div.textContent = item.name;
  div.classList.add("item-name");
  div.addEventListener("click", openEditMode);
  div.addEventListener("blur", closeEditMode);
  div.addEventListener("keydown", cancelEnter);

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "bi bi-x-circle delete-icon";
  deleteIcon.addEventListener("click", removeItem);

  const li = document.createElement("li");
  li.setAttribute("item-id", item.id);
  li.className = "border rounded";
  li.toggleAttribute("item-completed", item.completed);

  li.style.opacity = "0";
  li.style.transform = "translateY(20px)";
  
  li.appendChild(input);
  li.appendChild(div);
  li.appendChild(deleteIcon);

  setTimeout(() => {
    li.style.transition = "all 0.3s ease";
    li.style.opacity = "1";
    li.style.transform = "translateY(0)";
  }, 50);

  return li;
}

function addItem(input) {
  const newItem = creatListItem({
    id: generateId(),
    name: input.value,
    completed: false,
  });

  shoppingList.prepend(newItem);

  input.value = "";

  updateFilteredItems();

  saveToLS();

  updateState();
}

function generateId() {
  return Date.now().toString();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const input = document.getElementById("item_name");

  if (input.value.trim().length === 0) {
    showAlert("Lütfen bir ürün adı giriniz!", "danger");
    return;
  }

  addItem(input);
}

function toggleCompleted(e) {
  const li = e.target.parentElement;
  li.toggleAttribute("item-completed", e.target.checked);

  updateFilteredItems();

  saveToLS();
}

function removeItem(e) {
  const li = e.target.parentElement;
  shoppingList.removeChild(li);

  saveToLS();

  updateState();
}

function openEditMode(e) {
  const li = e.target.parentElement;
  if (li.hasAttribute("item-completed") == false) {
    e.target.contentEditable = true;
  }
}

function closeEditMode(e) {
  e.target.contentEditable = false;

  saveToLS();
}

function cancelEnter(e) {
  if (e.key == "Enter") {
    e.preventDefault();
    closeEditMode(e);
  }
}

function handleFilterSelection(e) {
  const filterBtn = e.target.closest('button');
  if (!filterBtn) return;

  for (let button of filterButtons) {
    button.classList.add("btn-secondary");
    button.classList.remove("btn-primary");
  }

  filterBtn.classList.add("btn-primary");
  filterBtn.classList.remove("btn-secondary");

  filterItems(filterBtn.getAttribute("item-filter"));
}

function filterItems(filterType) {
  const li_items = shoppingList.querySelectorAll("li");

  for (let li of li_items) {
    li.classList.remove("d-none");
    li.classList.remove("d-flex");

    const completed = li.hasAttribute("item-completed");

    if (filterType == "completed") {
      // tamamlananları göster
      li.classList.toggle(completed ? "d-flex" : "d-none");
    } else if (filterType == "incomplete") {
      // tamamlanmayanları göster
      li.classList.toggle(completed ? "d-none" : "d-flex");
    } else {
      // hepsini göster
      li.classList.toggle("d-flex");
    }
  }
}

function updateFilteredItems() {
  const activeFilter = document.querySelector(".btn-primary[item-filter]");
  filterItems(activeFilter.getAttribute("item-filter"));
}

function clear() {
  shoppingList.innerHTML = "";
  localStorage.clear("shoppingItems");

  updateState();
}

function updateState() {
  const isEmty = shoppingList.querySelectorAll("li").length === 0;
  const alert = document.querySelector(".alert");
  const filterBtns = document.querySelector(".filter-buttons");

  alert.classList.toggle("d-none", !isEmty);
  clearBtn.classList.toggle("d-none", isEmty);
  filterBtns.classList.toggle("d-none", isEmty);
}

function showAlert(message, type = "danger") {
  const alert = document.querySelector(".alert");
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  alert.classList.remove("d-none");
  
  setTimeout(() => {
    alert.classList.add("d-none");
  }, 3000);
}

function addToFavorites(itemName) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(itemName)) {
    favorites.push(itemName);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

function createQuickAddMenu() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.length > 0) {
    return `
      <div class="quick-add-menu">
        <h6>Sık Kullanılanlar</h6>
        ${favorites.map(item => `
          <button class="quick-add-item">
            <i class="bi bi-star-fill"></i> ${item}
          </button>
        `).join('')}
      </div>
    `;
  }
  return '';
}
