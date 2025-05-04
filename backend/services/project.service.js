import mongoose from 'mongoose';
import { Project } from '../models/project.model.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

const createProject = async ({ name, userId }) => {

    if (!name) {
        throw new ApiError("Name is required")
    }

    if (!userId) {
        throw new ApiError("UserId is required")
    }

    const project = await Project.create({
        name,
        users: [userId]
    })

    return project;

}

const getAllProjectByUserId = async ({ userId }) => {
    if(!userId) {
        throw new ApiError("UserId is required")
    }

    const allUserProject = await Project.find({
        users: userId
    })

    return allUserProject;
}

const addUsersToProject = async ({ projectId, users, userId }) => {

    if(!projectId) {
        throw new ApiError("ProjectId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError("Invalid projectId")
    }

    if(!users) {
        throw new ApiError("Users is required")
    }

    if(!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new ApiError("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new ApiError("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError("Invalid userId")
    }

    const project = await Project.findOne({
        _id: projectId,
        users: userId
    })

    if(!project) {
        throw new ApiError("User not belong to this project")
    }

    const updatedProject = await Project.findOneAndUpdate({
        _id: projectId
    }, 
    {
        $addToSet: {
            users: {
                $each: users
            }
        }
    },
    {
        new: true
    })

    return updatedProject;

};  

const getProjectById = async ({ projectId }) => {
    if(!projectId) {
        throw new ApiError("ProjectId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError("Invalid ProjectId")
    }

    const project = await Project.findOne({
        _id: projectId
    }).populate('users')

    return project;
}


export { 
    createProject,
    getAllProjectByUserId,
    addUsersToProject,
    getProjectById
}