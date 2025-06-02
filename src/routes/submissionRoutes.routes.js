import express from 'express'
import { isAuthenticated } from '../middleware/auth.middle.js';
import { getAllSubmission, getAllTheSubmissionsForProblem, getSubmissionForProblem } from '../controller/submission.controller.js';

const submissionRoutes = express.Router();

submissionRoutes.get("/get-all-submissions", isAuthenticated, getAllSubmission);

submissionRoutes.get("/get-all-submissions/:problemId", isAuthenticated, getSubmissionForProblem);

submissionRoutes.get("/get-submissions-count/:problemId", isAuthenticated, getAllTheSubmissionsForProblem);



export default submissionRoutes;