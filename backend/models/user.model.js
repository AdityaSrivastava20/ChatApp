import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        minLength: [6, "Email must be at least 6 characters long"],
        maxLength: [50, "Email must be at least 50 characters long"]
    },
    password: {
        type: String,
        select: false
    }
});

// Static method to hash passwords
userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10)
}


// Instance method to validate password
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// Generate JWT token
userSchema.methods.generateJWT = function() {
    return jwt.sign(
        { email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h'})
}

export const User = mongoose.model("User", userSchema)