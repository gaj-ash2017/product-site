document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();

  const header = `
    <header>
      <div class="logo-area">
        <img src="logo.png" alt="Logo" />
        <span>Your Business</span>
      </div>
    </header>
  `;

  const navbar = `
    <nav class="main-navbar">
      <ul class="navbar-menu">
        <li><a href="index.html">Home</a></li>
        <li><a href="products.html">Products</a></li>
        <li><a href="add-product.html" class="admin-only">Add Product</a></li>
        <li><a href="import.html" class="admin-only">Import</a></li>
        <li><a href="products-edit.html" class="admin-only">Admin</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="our-contact-details.html">Our Details</a></li>
      </ul>
    </nav>
    <div class="spacer"></div>
  `;

  const navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
    navbarContainer.innerHTML = header + navbar;

    // Highlight active link
    const links = navbarContainer.querySelectorAll(".navbar-menu a");
    links.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });

    // Hide admin-only links if not on admin site
    const isAdmin =
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("admin");
    if (!isAdmin) {
      document
        .querySelectorAll(".admin-only")
        .forEach((el) => (el.style.display = "none"));
    }
  }
});
