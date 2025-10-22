import Project from '../models/Project.js';
import { asyncHandler } from './asyncHandler.js';
/**
 * @desc Middleware to check if the user is either a project owner or a team member (including the team member)
 */
export const isTeamMember=asyncHandler(async(req,res,next)=>{
    const { projectId } = req.params;
    const userId = req.user.id;
    const project = await Project.findById(projectId);
    if (!project){
        res.status(404);
        throw new Error("Project not found");
    }

    const creatorId = project.projectCreator.toString();
    if (creatorId === userId) {
        req.project=project;
        return next();
    }
    const isMember=project.teamMembers.some(
        (memberId)=>memberId.toString()===userId
    );
    if (isMember){
        req.project=project;
        return next();
    }
    res.status(403);
    throw new Error("Not authorized: You are not a member of this project")
});
/**
 * @desc Middleware to check if the user is the Project Creator.
 */
export const isProjectCreator=asyncHandler(async(req,res,next)=>{
    const { projectId } = req.params;
    const userId = req.user.id;
    const project = req.project || (await Project.findById(projectId));
    if (!project){
        res.status(404);
        throw new Error("Project not found");
    }
    const creatorId = project.projectCreator.toString();
    if (creatorId != userId){
        res.status(403);
        throw new Error("Not Authorized: Only project creator can perform this action");
    }
    if (!req.project){
        req.project=project;
    }
    next();
})