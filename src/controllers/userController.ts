import { Request, Response} from "express";
import { User } from "../models/user";
import exp from "constants";
import  {Product}  from "../models/product";
import fs from "fs";
import path from "path";


// Función para obtener el perfil del usuario
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "No autorizado" });
            return;
        }

        const user = await User.findById(req.user.id).select("name email description image");
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        res.json({ name: user.name, email: user.email, description: user.description, image: user.image });
    } catch (err: any) {
        console.error("Error al obtener usuario:", err);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, description, image } = req.body;
        
        // Validamos que los datos estén presentes
        if (!name || !email || !description) {
            res.status(400).json({ message: "Faltan campos requeridos" });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: "No autorizado" });
            return; 
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return; 
        }

        // Actualizamos los campos del usuario
        user.name = name;
        user.email = email;
        user.description = description;
        user.image = image || user.image; // Si no se envía una nueva imagen, se mantiene la anterior

        await user.save();

        res.json({ message: "Usuario actualizado", user });
    } catch (err: any) {
        console.error("Error al actualizar usuario:", err);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getUserProducts = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id // Obtiene el ID del usuario desde el middleware de autenticación
        console.log("Id del usuario: ", userId);

        if (!userId) {
            res.status(401).json({message: "No autorizado"});
            return;
        }

        const user = await User.findById(userId).populate("products_for_sale")
        
        if(!user) {
            res.status(404).json({message: "Usuario no encontrado"});
            return; 
        }

        console.log("Productos del usuario: ", user.products_for_sale);
        res.json(user.products_for_sale);
    } catch (error) {
        res.status(500).json({message: "Error obteniendo los productos", error});
    }
}

// --------------------- Productos Favoritos ---------------------

export const getUserFavourites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;  // Obtén el ID del usuario
  
      if (!userId) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }
  
      const user = await User.findById(userId).populate("favourite_products");
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
  
      res.json(user.favourite_products);  // Devuelve los productos favoritos
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos favoritos", error });
    }
  };

export const addFavouriteProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!userId || !productId) {
            res.status(400).json({ message: "Faltan campos requeridos" });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        // Verificamos que el producto no esté ya en la lista de favoritos
        if (user.favourite_products.includes(productId)) {
            res.status(400).json({ message: "El producto ya está en favoritos" });
            return;
        }

        user.favourite_products.push(productId);
        await user.save();

        res.json({ message: "Producto añadido a favoritos" });
    } catch (error) {
        res.status(500).json({ message: "Error al añadir producto a favoritos", error });
    }
}

export const removeFavouriteProduct = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!userId || !productId) {
            res.status(400).json({ message: "Faltan campos requeridos" });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        // Verificamos que el producto esté en la lista de favoritos
        if (!user.favourite_products.includes(productId)) {
            res.status(400).json({ message: "El producto no está en favoritos" });
            return;
        }

        // Eliminamos el producto de la lista de favoritos
        user.favourite_products = user.favourite_products.filter(
            (favProductId) => favProductId.toString() !== productId
        );

        await user.save();

        res.json({ message: "Producto eliminado de favoritos" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar producto de favoritos", error });
    }
}


// --------------------- Productos a la venta ---------------------

export const removeProductForSale = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.body;

        if(!userId || !productId) {
            res.status(400).json({message: "Faltan campos requeridos"});
            return;
        }

        const user = await User.findById(userId);
        if(!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        if(!user.products_for_sale.includes(productId)) {
            res.status(400).json({ message: "Error al eliminar el producto"});
            return;
        }

        user.products_for_sale = user.products_for_sale.filter(
            (saleProductId) => saleProductId.toString() !== productId
        );

        await user.save();

        // Busca el producto en la colección de productos
        const product = await Product.findById(productId);
        if(!product) {
            res.status(404).json({ message: "Producto no encontrado" });
            return;
        }

        // Elimina la imagen asociada del sistema de archivos
        if(product.image) {
            const imagePath = path.join(__dirname, "..", product.image);
            if(fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Product.findByIdAndDelete(productId);

        res.json({ message: "Producto eliminado de la lista de productos a la venta" });
    } catch (error) {
        console.error("Error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}