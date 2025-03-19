import express from "express";
import cors from "cors";
import { connectDB } from "./database";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import auth from "./middleware/auth"; // Importa el middleware de autenticación
import productRoutes from './routes/productRoutes'
import userRoutes from './routes/userRoutes';
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4500;

const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log("Ruta a la carpeta uploads: ", uploadsPath);

// Configuración de CORS: Permitir solo el origen del frontend con credenciales
const FRONTEND_URL = process.env.FRONTEND_URL || "https://keyla-frontend.vercel.app"

app.use(cors({
  origin: FRONTEND_URL, // Para el deploy cambiar por FRONTENT_URL
  credentials: true, // Permitir el envío de cookies o headers de autenticación
}));

// Middlewares
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Rutas
app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

app.use("/auth", authRoutes);

app.use("/user", userRoutes);

app.use("/products", productRoutes);



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
