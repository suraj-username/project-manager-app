import express from 'express';
const router=express.Router();
import {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.middleware.js';
import {
    isTeamMember,
    isProjectCreator,
} from '../middleware/authorization.js';

/*Main ROutes for Project Resources*/
// POST(GET) /api/project - default
router.route('/')
    .post(protect,createProject)
    .get(protect,getMyProjects);

router.route('/:projectId')
    .get(protect,isTeamMember,getProjectById) //GET default/:projectId/
    .put(protect,isProjectCreator,updateProject)//PUT default/:projectId/
    .delete(protect,isProjectCreator,deleteProject);//DELETE default/:projectId/
/*Team Management Routes*/
router.route('/:projectId/team') //POST default/:projectId/team
    .post(protect,isProjectCreator,addMember);
router.route('/:projectId/team/:userId') //DELETE default/:projectId/team/userId
    .delete(protect,isProjectCreator,removeMember);
export default router;