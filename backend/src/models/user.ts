import { Schema, model, Document} from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    products_for_sale: string[];
    favourite_products: string[];
    forum_posts: string[];
    movements: string[];
    image?: string;
    description: string;
}

const UserSchema = new Schema<IUser>({
    name: { type: String },
    email: { type: String, required: false },
    password: { type: String, required: true },
    products_for_sale: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    favourite_products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    forum_posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    movements: [{ type: Schema.Types.ObjectId, ref: 'Movement' }],
    image: { type: String, default: 'https://static.vecteezy.com/system/resources/previews/018/765/757/non_2x/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg' }, // Imagen por defecto
    description: { type: String, default: '' }
});

export const User = model<IUser>('User', UserSchema);