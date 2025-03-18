import express from 'express';
import { getUserProducts, getUserProfile, updateUserProfile, addFavouriteProduct, removeFavouriteProduct, getUserFavourites, removeProductForSale } from '../controllers/userController';
import auth from '../middleware/auth';

const router = express.Router();


router.get('/me', auth, async (req, res) => {
  try {
    await getUserProfile(req, res);
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put('/update', auth, updateUserProfile);

// Productos:

router.get("/products", auth, getUserProducts);

// Productos favoritos:

router.get("/favourites", auth, getUserFavourites);

router.post("/add-favourite", auth, addFavouriteProduct);

router.delete("/remove-favourite", auth, removeFavouriteProduct)


// Productos a la venta

router.delete("/remove-product-for-sale", auth, removeProductForSale)

export default router;