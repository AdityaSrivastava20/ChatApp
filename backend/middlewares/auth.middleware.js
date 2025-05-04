import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: "Unauthorized User" });
        }

        const isBlackListed = await redisClient.get(token);

        if (isBlackListed) {
            res.clearCookie("token"); 
            return res.status(401).send({ error: "Token is blacklisted. Unauthorized User" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.log(error);
        res.status(401).send({ error: "Unauthorized User" });
    }
};

export { authUser };
