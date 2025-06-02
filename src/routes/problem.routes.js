import express from 'express'
import { checkAdmin, isAuthenticated } from '../middleware/auth.middle.js';
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getProblemById, updateProblem } from '../controller/problem.controller.js';

const problemRoutes = express.Router();

problemRoutes.post('/create-problem',isAuthenticated, checkAdmin, createProblem)

problemRoutes.get('/get-all-problems', isAuthenticated, getAllProblems);

problemRoutes.get('/get-problem/:id', isAuthenticated, getProblemById);

problemRoutes.put('/get-problem/:id', isAuthenticated, checkAdmin, updateProblem);

problemRoutes.delete('/delete-problem/:id', isAuthenticated, checkAdmin, deleteProblem);

problemRoutes.get('/get-solved-problems', isAuthenticated, getAllProblemsSolvedByUser);

export default problemRoutes;