import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
mongoClient.connect().then( () => {
    db = mongoClient.db('mywallet')
});


app.post('/sign-up', async (req, res) => {
    const user = req.body;

    try {
        const userDB = await db.collection('users').find({email: user.email}).toArray();

        if (userDB.length !== 0) {
            return res.status(409).send('Já existe um usuário com esse e-mail');
        }

        const passwordHash = bcrypt.hashSync(user.password, 10);

        const newUser = await db.collection('users').insertOne({...user, password: passwordHash});

        res.status(201).send(newUser);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({email});

        if (user && bcrypt.compareSync(password, user.password)) {
            
            return res.status(200).send(user);
        }

        res.sendStatus(404)
    } catch (error) {
        res.status(500).send(error);
    }
})



app.get('/', async (req, res) => {
    try {
        const user = await db.collection('users').find().toArray();
        res.send(user);
    } catch (error) {
        res.sendStatus(500)
    }
});



app.listen(5000, () => {
    console.log('Listening on port  5000')
})