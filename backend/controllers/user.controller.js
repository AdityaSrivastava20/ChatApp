import { User } from "../models/user.model.js";
import { createUser, getAllUsers } from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from "../services/redis.service.js";

// Controller to handle user registration
const createUserController = async (req, res) => {
    // Validate incoming request using express-validator
    const errors = validationResult(req);

    // If validation errors exist, return 400 Bad Request with error details
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Create a new user with the provided data
        const user = await createUser(req.body);

        // Generate a JWT token for the newly created user
        const token = await user.generateJWT(); // 🔧 Changed from User.generateJWT()

        delete user._doc.password;

        // Send back the created user and token
        res.status(201).json({ user, token });
        
    } catch (error) {
        // If any error occurs, return 400 Bad Request with error message
        res.status(400).send(error.message);
    }
}

const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array() })
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select(" +password ");

        if(!user) {
           return res.status(401).json({ errors: "Invalid credentials" })
        }

        const isMatch = await user.isValidPassword(password);

        if(!isMatch) {
            return res.status(401).json({ errors: "Invalid credentials" })
        }

        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(201).json({ user, token })
        
    } catch (err) {
        console.log(err)
        res.status(400).send(err.message)
    }
}

const profileController = async (req, res) => {
    console.log(req.user);

    res.status(200).json({
        user: req.user
    })
}

const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        // Blacklist token for 24 hours (or match your token's expiry)
        await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        // Optional: Clear the cookie if using cookie-based auth
        res.clearCookie('token');

        res.status(200).json({
            message: "Logged Out Successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
};

const getAllUsersController = async (req, res) => {

    try {

        const loggedInUser = await User.findOne({
            email: req.user.email
        })

        const allUsers = await getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })


    } catch (err) {
        console.log(err);

        res.status(400).json({ err: err.message})
    }
}


export { 
    createUserController,
    loginController,
    profileController,
    logoutController,
    getAllUsersController
 };
