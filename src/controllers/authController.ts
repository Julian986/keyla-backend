import { Request, Response } from "express";
import { User, IUser } from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signUp = async (req: Request, res: Response): Promise<void> => {
    const { name, password } = req.body;

    try {
        let user = await User.findOne({ name });
        if (user) {
            res.status(400).json({ message: "El usuario ya existe" });
            return;
        }

        user = new User({ name, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

        res.json({ token });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
};

const logIn = async (req: Request, res: Response): Promise<void> => {
    const { name, password } = req.body;

    try {
        const user = await User.findOne({ name });
        if (!user) {
            res.status(400).json({ message: "No existe un usuario con ese nombre" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Las contraseñas no coinciden" });
            return;
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

        res.json({ token });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
};

const getUserProfile = async (req: Request, res: Response): Promise<void> => {
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

export { signUp, logIn, getUserProfile };
