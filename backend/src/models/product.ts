import { Schema, model, Document} from 'mongoose';

interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    brand: string;
    image: string;
    seller: {
        id: string;
        name: string;
    };
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required:true },
    category: { type: String, required: true },
    brand: {type: String, required: true },
    image: { type: String },
    seller: {
        id: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true }
    }
});

export const Product = model<IProduct>('Product', ProductSchema);