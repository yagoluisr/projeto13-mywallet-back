import express from 'express';
import hasToken from '../Middlewares/userMiddleware.js';
import { getUserData, insertEntry, insertOutput } from '../Controllers/userController.js';

const router = express.Router();

//Middleware
router.use(hasToken);

//Rotas
router.get('/', getUserData);
router.post('/novaentrada', insertEntry);
router.post('/novasaida', insertOutput);

export default router;