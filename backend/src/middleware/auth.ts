import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Definir la estructura del token decodificado
interface DecodedToken {
    user: {
        id: string;
        // Otros campos que quieras agregar del usuario, como su nombre, email, etc.
    };
}

// Extender el tipo Request para incluir la propiedad 'user'
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                // Otros campos si los necesitas
            };
        }
    }
}

// Middleware de autenticación
const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Obtener el token del encabezado
    console.log("Middleware de autenticacion ejecutandose")
    const token = req.header("x-auth-token");

    // Verificar si no hay token
    if (!token) {
        res.status(401).json({ message: "No hay token, autorización denegada" });
        return; 
    }

    // Verificar el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as DecodedToken;
        //console.log("Token verificado:", decoded);
        // Asignar el usuario decodificado a la solicitud
        req.user = decoded.user;
        next(); // Pasar al siguiente middleware o manejador de ruta
    } catch (err) {
        res.status(401).json({ message: "Token inválido" });
    }
};

export default auth;
