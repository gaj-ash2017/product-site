const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csv = require("csv-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const productsFile = path.join(__dirname, "products.json");

// Serve products.json to frontend
app.get("/products.json", (req, res) => {
  res.sendFile(productsFile);
});

// Import CSV route
const upload = multer({ dest: "uploads/" });

app.post("/import-csv", upload.single("csvfile"), (req, res) => {
  if (!req.file) return res.status(400).send("No CSV file uploaded.");

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const product = {
        stockCode: row.stockCode?.trim() || "",
        name: row.name?.trim() || "",
        description: row.description?.trim() || "",
        category: row.category?.trim() || "",
        extraNotes: row.extraNotes?.trim() || "",
        quantity: parseInt(row.quantity) || 0,
        image: row.imageName?.trim() || "default.jpg",
      };
      results.push(product);
    })
    .on("end", () => {
      fs.readFile(productsFile, "utf-8", (err, data) => {
        let existingProducts = [];

        if (!err && data) {
          try {
            existingProducts = JSON.parse(data);
          } catch (e) {
            return res.status(500).send("Error parsing existing products.");
          }
        }

        results.forEach((newProd) => {
          const index = existingProducts.findIndex(
            (p) => p.stockCode.toLowerCase() === newProd.stockCode.toLowerCase()
          );
          if (index >= 0) {
            existingProducts[index] = newProd;
          } else {
            existingProducts.push(newProd);
          }
        });

        fs.writeFile(
          productsFile,
          JSON.stringify(existingProducts, null, 2),
          (err) => {
            if (err) return res.status(500).send("Error saving products.");
            fs.unlink(req.file.path, () => {});
            res.send("✅ Products imported successfully!");
          }
        );
      });
    })
    .on("error", () => res.status(500).send("Error processing CSV."));
});

// Edit product route
app.post("/edit-product", (req, res) => {
  const updated = req.body;

  fs.readFile(productsFile, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Could not read products.");

    let products = JSON.parse(data);
    const index = products.findIndex((p) => p.stockCode === updated.stockCode);
    if (index === -1) return res.status(404).send("Product not found.");

    products[index] = updated;

    fs.writeFile(productsFile, JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).send("Failed to save product.");
      res.send("✅ Product updated successfully!");
    });
  });
});

// Delete product route
app.post("/delete-product", (req, res) => {
  const stockCodeToDelete = req.body.stockCode;

  fs.readFile(productsFile, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading products.");

    let products = JSON.parse(data);
    const product = products.find((p) => p.stockCode === stockCodeToDelete);
    if (!product) return res.status(404).send("Product not found.");

    const imageToDelete = product.image;
    products = products.filter((p) => p.stockCode !== stockCodeToDelete);

    fs.writeFile(productsFile, JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving products.");

      const imgPath = path.join(__dirname, "public/uploads", imageToDelete);
      if (imageToDelete !== "default.jpg" && fs.existsSync(imgPath)) {
        fs.unlink(imgPath, () => {});
      }

      res.send("✅ Product deleted.");
    });
  });
});

app.post("/delete-product", (req, res) => {
  const stockCodeToDelete = req.body.stockCode;

  fs.readFile(productsFile, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading products.");

    let products = JSON.parse(data);
    const product = products.find((p) => p.stockCode === stockCodeToDelete);
    if (!product) return res.status(404).send("Product not found.");

    const imageToDelete = product.image;
    products = products.filter((p) => p.stockCode !== stockCodeToDelete);

    fs.writeFile(productsFile, JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).send("Error saving products.");

      const imgPath = path.join(__dirname, "public/uploads", imageToDelete);
      if (imageToDelete !== "default.jpg" && fs.existsSync(imgPath)) {
        fs.unlink(imgPath, () => {});
      }

      res.send("✅ Product deleted.");
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
