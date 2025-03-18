import { Request, Response } from "express";
import { Product } from "../models/product";
import { User } from "../models/user";
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import sharp from "sharp";

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find(); // Obtiene todos los productos de la base de datos
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener los productos: ", error);
    res.status(500).json({message: "Error al obtener los productos"});
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const userId = req.user.id; // Se obtiene del middleware de autenticación

    // Obtener el usuario
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (!req.file) {
      res.status(400).json({message: "Debes subir una imagen"});
      return;
    }

    // Ruta temporal de la imagen subida
    const imagePath = req.file.path;

    // Eliminar el fondo de la imagen usando la API de Remove.bg  Cuenta de gmail: Js70....
    const apiKey = "3TG9HC6h5pCoe9QWZEWH4wck";
    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(imagePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": apiKey,
        },
        responseType: "arraybuffer"
      }
    );

    console.log("Respuesta de Remove.bg: ", response.status);


    // Procesar la imagen con Sharp

    const processedImage = await sharp(response.data)
    .resize(800, 600, { // Redimensiona a 800x600 (horizontal)
      fit: "contain", // Asegura que la imagen cubra el área sin distorsionarse
    })
    .toFormat("png")
    .toBuffer(); // Convierte la imagen procesada a un buffer

    const metadata = await sharp(response.data).metadata();
    console.log("Metadatos de la imagen:", metadata);

    
    // Guardar la imagen procesada en la carpeta uploads
    const outputPath = path.join("uploads", `no_bg_${Date.now()}.png`);
    fs.writeFileSync(outputPath, processedImage);

    // Crear un nuevo producto
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      brand: req.body.brand,
      image: outputPath,
      seller: {
        id: userId,
        name: user.name,
      },
    });

    // Guardar en la base de datos
    await newProduct.save();

    // Agregar el producto a "products_for_sale" del usuario
    await User.findByIdAndUpdate(userId, {
      $push: { products_for_sale: newProduct._id },
    });

    // Elimina la imagen temporal
    fs.unlinkSync(imagePath);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al publicar el producto" });
  }
};