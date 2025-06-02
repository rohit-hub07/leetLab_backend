import { isAuthenticated } from '../middleware/auth.middle.js';
import {executeCode}  from '../controller/executeCode.controller.js';

import express 
from 'express';
const executionRoute = express.Router();

executionRoute.post("/", isAuthenticated, executeCode)

export default executionRoute;