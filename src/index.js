import express from 'express';
import cors from 'cors';

import authRouter from './Routes/authRoutes.js';
import userRouter from './Routes/userRoutes.js';


const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(authRouter,userRouter)


//Rotas de autenticação
app.post(authRouter);
app.post(authRouter);

//Rotas do usuário
app.get(userRouter);
app.post(userRouter);
app.post(userRouter);


app.listen(5000, () => {
    console.log('Listening on port  5000')
})