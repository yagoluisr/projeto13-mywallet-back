import express from 'express';
import cors from 'cors';
import { signIn, signUp } from './Controllers/authController.js';
import { getUserData, insertEntry, insertOutput } from './Controllers/userController.js';


const app = express();

app.use(cors());
app.use(express.json());


app.post('/sign-up', signIn);

app.post('/sign-in', signUp);

app.get('/', getUserData);

app.post('/novaentrada', insertEntry);

app.post('/novasaida', insertOutput);




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