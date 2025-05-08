document.addEventListener("DOMContentLoaded", () => {
  const current = window.location.pathname.split("/").pop();

  document.getElementById("navbar").innerHTML = `
    <header>
      <div class="logo-area">
        <img src="logo.png" alt="Logo" />
        <span>Your Business</span>
      </div>
      <nav>
        <a href="index.html" class="${
          current === "index.html" || current === "" ? "active" : ""
        }">Home</a>
        <a href="about.html" class="${
          current === "about.html" ? "active" : ""
        }">About</a>
        <a href="products.html" class="${
          current === "products.html" ? "active" : ""
        }">Products</a>
        <a href="contact.html" class="${
          current === "contact.html" ? "active" : ""
        }">Contact</a>
        <a href="our-contact-details.html" class="${
          current === "our-contact-details.html" ? "active" : ""
        }">Our Details</a>
      </nav>
    </header>
    <div class="spacer"></div>
  `;
});
