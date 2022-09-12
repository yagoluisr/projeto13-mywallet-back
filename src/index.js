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




// setInterval(async ()=> {
//     const user = await db.collection('users').find().toArray();

//     const filterParticipants = user.filter(obj => ())

//     try {
        


//     } catch (error) {
//         console.log(error)
//     }

//     let fiveMinutes = 1000 * 60 * 5
//     await db.collection('sessions').find({lastStatus:  })
// }, 5000)




app.get('/sessions', async (req, res) => {
    let a = await db.collection('sessions').find().toArray();
    res.send(a);
});

app.get('/users', async (req, res) => {
    let a = await db.collection('users').find().toArray();
    res.send(a);
});



app.listen(5000, () => {
    console.log('Listening on port  5000')
})