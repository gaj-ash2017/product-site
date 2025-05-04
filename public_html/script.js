const API_BASE = "http://localhost:3000";

function populateCategoryFilter(products) {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;

  const uniqueCategories = [...new Set(products.map(p => p.category || "Uncategorized"))];
  filter.innerHTML = `<option value="all">All</option>`;
  uniqueCategories.forEach(cat => {
    filter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

async function displayProducts(sort = "newest", filterCategory = "all") {
  const container = document.getElementById("product-list");
  if (!container) return;
  const res = await fetch(`${API_BASE}/products.json`);
  let products = await res.json();

  populateCategoryFilter(products);

  if (filterCategory !== "all") {
    products = products.filter(
      (p) => (p.category || "Uncategorized") === filterCategory
    );
  }

  if (sort === "newest") {
    products.sort((a, b) => b.id - a.id);
  } else if (sort === "oldest") {
    products.sort((a, b) => a.id - b.id);
  } else if (sort === "az") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "za") {
    products.sort((a, b) => b.name.localeCompare(a.name));
  }

  container.innerHTML = "";
  for (const p of products) {
    container.innerHTML += `
      <div class="product-card">
        <img src="${API_BASE}/${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p><strong>Category:</strong> ${p.category || "Uncategorized"}</p>
        <button onclick="editProduct(${p.id})">Edit</button>
        <button onclick="deleteProduct('${p.image}')">Delete</button>
      </div>`;
  }
}

function editProduct(id) {
  window.location.href = `add-product.html?editId=${id}`;
}

async function deleteProduct(imagePath) {
  if (!confirm("Delete this product permanently?")) return;
  try {
    const filename = imagePath.split("/").pop();
    await fetch(`${API_BASE}/upload/${filename}`, { method: "DELETE" });
    displayProducts();
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-list");
  const sortSelect = document.getElementById("sort");
  const filter = document.getElementById("categoryFilter");

  if (container) displayProducts();

  if (sortSelect && filter) {
    sortSelect.addEventListener("change", () => {
      displayProducts(sortSelect.value, filter.value);
    });
    filter.addEventListener("change", () => {
      displayProducts(sortSelect.value, filter.value);
    });
  }

  const form = document.getElementById("productForm");
  if (form) {
    const editId = new URLSearchParams(location.search).get("editId");
    if (editId) prefillForm(editId);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData();
      fd.append("name", document.getElementById("name").value);
      fd.append("description", document.getElementById("description").value);
      fd.append("category", document.getElementById("category").value);
      fd.append("image", document.getElementById("image").files[0]);
      if (editId) {
        const payload = {
          name: document.getElementById("name").value,
          description: document.getElementById("description").value,
          category: document.getElementById("category").value,
        };
        await fetch(`${API_BASE}/products/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
      }
      alert("Product saved!");
      form.reset();
      window.location.href = "products.html";
    });
  }
});

async function prefillForm(id) {
  const res = await fetch(`${API_BASE}/products.json`);
  const products = await res.json();
  const found = products.find(p => p.id == id);
  if (!found) return;
  document.getElementById("name").value = found.name;
  document.getElementById("description").value = found.description;
  document.getElementById("category").value = found.category || "";
}
