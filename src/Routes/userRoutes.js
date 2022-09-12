import express from 'express';
import { getUserData, insertEntry, insertOutput } from '../Controllers/userController.js';

const router = express.Router();

router.get('/', getUserData);
router.post('/novaentrada', insertEntry);
router.post('/novasaida', insertOutput);

export default router;