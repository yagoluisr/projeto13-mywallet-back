import express from 'express';
import { signIn, signUp } from '../Controllers/authController.js';

const router = express.Router();

router.post('/sign-up', signIn);
router.post('/sign-in', signUp);

export default router;