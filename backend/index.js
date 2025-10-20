// index.js
require("dotenv").config(); // .env
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth"); 
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const categoriaRoutes = require('./routes/categorias');   
const kitchenRoutes = require('./routes/kitchen'); 
const grupoOpcionRoutes = require('./routes/gruposOpciones');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// fotos de perfil
// http://localhost:3001/uploads/nombredelaimagen.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categorias', categoriaRoutes);      
app.use('/api/grupos-opciones', grupoOpcionRoutes)
app.use('/api/kitchen', kitchenRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
