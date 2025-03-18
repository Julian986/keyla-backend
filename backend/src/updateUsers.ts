import mongoose from 'mongoose';
import { User } from './models/user';

const updateOldUsers = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/keylaDB'); // Ajusta la URL de tu BD

        const result = await User.updateMany(
            { email: { $exists: false } }, // Busca usuarios sin description
            { $set: { email: '' } } // Agrega la imagen por defecto
        );

        console.log(`Usuarios actualizados: ${result.modifiedCount}`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error actualizando usuarios:', error);
    }
};

updateOldUsers();
