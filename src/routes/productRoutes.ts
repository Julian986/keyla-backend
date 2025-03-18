import express from "express";
import { createProduct, getAllProducts } from "../controllers/productController";
import auth from "../middleware/auth"; // Middleware para verificar autenticación
import upload from "../config/multerConfig";

const router = express.Router();

router.get("/", getAllProducts);

// Ruta protegida para publicar un producto
router.post("/publish", auth, upload.single("image"), createProduct);

export default router;
