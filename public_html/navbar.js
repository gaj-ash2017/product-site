document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    navbar.innerHTML = `
      <nav>
        <a href="index.html">Home</a> |
        <a href="products.html">Products</a> |
        <a href="add-product.html">Add Product</a>
      </nav>
    `;
  }
});