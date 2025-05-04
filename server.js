
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public_html")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const dataFile = path.join(__dirname, "products.json");

function readProducts() {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile));
}

app.get("/products.json", (req, res) => {
  res.json(readProducts());
});

app.post("/upload", upload.single("image"), (req, res) => {
  const { name, description, category } = req.body;
  const image = req.file ? `uploads/${req.file.filename}` : "";

  const newProduct = {
    id: Date.now(),
    name,
    description,
    category,
    image,
  };

  const products = readProducts();
  products.push(newProduct);
  fs.writeFileSync(dataFile, JSON.stringify(products, null, 2));

  res.json({ success: true });
});

app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;
  const products = readProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  products[index] = { ...products[index], ...updatedData };
  fs.writeFileSync(dataFile, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

app.delete("/upload/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  const dataPath = path.join(__dirname, "products.json");

  if (!fs.existsSync(dataPath))
    return res.status(404).json({ error: "No products found" });

  let products = JSON.parse(fs.readFileSync(dataPath));
  products = products.filter(p => p.image !== `uploads/${req.params.filename}`);
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
