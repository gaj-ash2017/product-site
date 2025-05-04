document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbar");
  const isLive = location.hostname.includes("onrender.com");

  if (nav) {
    nav.innerHTML = `
      <nav>
        <a href="index.html">Home</a> |
        <a href="products.html">Products</a>
        ${!isLive ? '| <a href="add-product.html">Add Product</a>' : ''}
      </nav>
    `;
  }
});