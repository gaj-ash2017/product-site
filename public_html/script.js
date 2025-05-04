const API_BASE = "";
const IS_LIVE = location.hostname.includes("onrender.com");

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("product-list")) displayProducts();

  const form = document.getElementById("productForm");
  if (form) {
    const editId = new URLSearchParams(location.search).get("editId");
    if (editId) prefillForm(editId);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (IS_LIVE) {
        alert("Adding products is disabled on the live site.");
        return;
      }
      const fd = new FormData();
      fd.append("name", document.getElementById("name").value);
      fd.append("description", document.getElementById("description").value);
      fd.append("category", document.getElementById("category").value);
      fd.append("image", document.getElementById("image").files[0]);
      if (editId) {
        const payload = {
          name: fd.get("name"),
          description: fd.get("description"),
          category: fd.get("category"),
        };
        await fetch(`${API_BASE}/products/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
      }
      alert("Saved!");
      form.reset();
      window.location.href = "products.html";
    });
  }

  const sort = document.getElementById("sort");
  const filter = document.getElementById("categoryFilter");
  if (sort && filter) {
    sort.addEventListener("change", () => displayProducts(sort.value, filter.value));
    filter.addEventListener("change", () => displayProducts(sort.value, filter.value));
  }
});

async function displayProducts(sort = "newest", filterCategory = "all") {
  const res = await fetch(`${API_BASE}/products.json`);
  let products = await res.json();

  const container = document.getElementById("product-list");
  if (!container) return;

  const filter = document.getElementById("categoryFilter");
  if (filter) {
    const uniqueCategories = [...new Set(products.map(p => p.category || "Uncategorized"))];
    filter.innerHTML = '<option value="all">All</option>';
    uniqueCategories.forEach(cat => {
      filter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  }

  if (filterCategory !== "all") {
    products = products.filter(p => (p.category || "Uncategorized") === filterCategory);
  }

  if (sort === "newest") products.sort((a, b) => b.id - a.id);
  else if (sort === "oldest") products.sort((a, b) => a.id - b.id);
  else if (sort === "az") products.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "za") products.sort((a, b) => b.name.localeCompare(a.name));

  container.innerHTML = "";
  for (const p of products) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${API_BASE}/${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>Category:</strong> ${p.category || "Uncategorized"}</p>
    `;
    if (!IS_LIVE) {
      card.innerHTML += `
        <button onclick="editProduct(${p.id})">Edit</button>
        <button onclick="deleteProduct('${p.image}')">Delete</button>
      `;
    }
    container.appendChild(card);
  }
}

function editProduct(id) {
  window.location.href = `add-product.html?editId=${id}`;
}

async function deleteProduct(imagePath) {
  if (!confirm("Delete this product permanently?")) return;
  const filename = imagePath.split("/").pop();
  await fetch(`${API_BASE}/upload/${filename}`, { method: "DELETE" });
  displayProducts();
}

async function prefillForm(id) {
  const res = await fetch(`${API_BASE}/products.json`);
  const products = await res.json();
  const found = products.find(p => p.id == id);
  if (!found) return;
  document.getElementById("name").value = found.name;
  document.getElementById("description").value = found.description;
  document.getElementById("category").value = found.category || "";
}