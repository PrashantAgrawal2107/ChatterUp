import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String
});

export const UserModel = mongoose.model('User', userSchema);