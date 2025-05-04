import { User } from '../models/user.model.js';
import * as projectService from '../services/project.service.js';
import { validationResult } from 'express-validator';


const createProject = async (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    try {
        const {name} = req.body;
        const loggedInUser = await User.findOne({ email: req.user.email });
    
        const userId = loggedInUser._id;
    
        const newProject = await projectService.createProject({ name, userId });
    
        res.status(201).json(newProject);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}

const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await User.findOne({
            email: req.user.email
        })

        const allUserProject = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({
            projects: allUserProject
        })

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message })        
    }
}

const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body
        console.log(req.body)

        const loggedInUser = await User.findOne({
            email: req.user.email
        })
            

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project
        })
        
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message })
    }

}

const getProjectById = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await projectService.getProjectById({projectId})

        return res.status(200).json({ project })
        
    } catch (err) {
        console.log(err)
        res.status(400).json({ err: err.message })
    }
}

export {
    createProject,
    getAllProject,
    addUserToProject,
    getProjectById
} 