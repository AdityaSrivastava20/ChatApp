import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Project } from './models/project.model.js';



const port = process.env.PORT || 3000

const server = http.createServer(app);
const io = new Server(server, {
    cors: '*'
});

io.use( async (socket, next) => {

    try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        socket.project = await Project.findOne({
            _id: projectId
        })

        Project.findById(projectId)

        if (!token) {
            return next(new Error("Authentication Error"))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error("Authentication Error"))
        }

        socket.user = decoded;

        next();
        
    } catch (error) {
        next(error)
    }
})   

io.on('connection', Socket => {

    Socket.roomId = Socket.project._id.toString();

    console.log("A user connected");

    

    Socket.join(Socket.roomId);

    Socket.on('project-message', data => {

        console.log(data);

        Socket.broadcast.to(Socket.roomId).emit('project-message', data)
    })

    Socket.on('disconnect', () => { 
        console.log("A user disconnected");
        Socket.leave(Socket.roomId);
     });
});



server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})