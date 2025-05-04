import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

const createUser = async ({ email, password }) => {
    if(!email || !password) {
        throw new ApiError("Email or password is required")
    }

    const hashedPassword = await User.hashPassword(password);

    const user = User.create({email, password: hashedPassword })
    return user;
}

const getAllUsers = async ({ userId }) => {
    const users = await User.find({
        _id: { $ne: userId }
    });
    return users; 
}

export { 
    createUser, 
    getAllUsers
};
