/**
 * handle requests related to projects
 */
import Project from '../models/Project.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
// @desc Creating a new project
// @route POST /api/projects
// @access Private

export const createProject=asyncHandler(async(req,res)=>{
    const { name, description } = req.body;
    if (!name){
        res.status(400);
        throw new Error("Project name is required");
    }
    const project = new Project({
        name,
        description: description || '',
        projectCreator: req.user.id,
        teamMembers: [req.user.id],
    });
    const createdProject=await project.save();
    res.status(201).json(createdProject);
});
//@desc Get all projects for the user that is logged in
// @route GET /api/projects
// @access Private
export const getMyProjects=asyncHandler(async(req,res)=>{
    const projects = await Project.find({
        $or:[
            { projectCreator: req.user.id },
            { teamMembers: req.user.id },
        ],
    })
    .populate('projectCreator','name email')
    .populate('teamMembers','name email');
    res.status(200).json(projects);
});
// @desc Get project by ID
//@route GET /api/projects/:projectId
//@access Private (Team member specifically)
export const getProjectById=asyncHandler(async(req,res)=>{
    const project = await Project.findById(req.project._id)
    .populate('projectCreator','name email')
    .populate('teamMembers','name email');
    if (project){
        res.status(200).json(project);
    } else {
        res.status(404);
        throw new Error("Project not found");
    }
});
// @desc Updating a project 
// @route PUT /api/projects/:projectId
// @access Private (Project Creator specific control)

export const updateProject=asyncHandler(async(req,res)=>{
    const project = req.project;
    const { name,description } = req.body;
    if (name) project.name = name;
    if (description) project.description=description;
    const updatedProject=await project.save();
    res.status(200).json(updatedProject);
});
// @desc Deleting a project
// @route DELETE /api/projects/:projectId
// @access Private (Project creator specific control)
export const deleteProject= asyncHandler(async (req,res)=>{
    await Project.deleteOne({_id:req.project._id});
    res.status(200).json({message:"Project deleted successfully."});
});

// @desc Adding a member to the project
// @route POST /api/projects/:projectId/team
// @access Private (Project creator specific control)

export const addMember=asyncHandler(async(req,res)=>{
    const { email } = req.body;
    const project = req.project;
    const user=await User.findOne({ email });
    if (!user){
        res.status(400);
        throw new Error("User not found with given email");
    }
    const isMember=project.teamMembers.some(
        (memberId)=>memberId.toString()=== user._id.toString()
    );
    if (isMember){
        res.status(400);
        throw new Error("User is already member");
    }
    project.teamMembers.push(user._id);
    await project.save();
    res.status(200).json({message:`${user.name} added to the project successfully.`});
});
//@desc Removing member from alloted project
//@route DELETE /api/projects/:projectId/team/:userId
// @access Private (Project creator only)
export const removeMember=asyncHandler(async(req,res)=>{
    const { userId }=req.params;
    const project = req.project;
    if (project.projectCreator.toString()==userId){
        res.status(400);
        throw new Error("Project creator cannot be removed");
    }
    project.teamMembers.pull(userId);
    await project.save();
    res.status(200).json({message:"${userId} removed from the project successfully."});
});