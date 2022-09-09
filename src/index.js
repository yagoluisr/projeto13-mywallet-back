import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

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
        const userDB = await db.collection('users').findOne({email: user.email});

        if (userDB) {
            return res.status(409).send('Já existe um usuário com esse e-mail');
        }

        const passwordHash = bcrypt.hashSync(user.password, 10);

        const newUser = await db
            .collection('users')
            .insertOne({
                ...user, 
                password: passwordHash, 
                extract: []
            });

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
            const token = uuid();

            //console.log(user)
            
            let a = await db.collection('sessions').insertOne({
                userId: user._id,
                name: user.name,
                token
            })
            
            console.log(a)

            return res.status(200).send(user);
        }

        res.sendStatus(404)
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.status(404).send('Faltou o token !');
    

    try {
        const userSession = await db.collection('sessions').findOne({token: token})
        
        if (!userSession) return res.status(404).send("Não está logado");
        
        const user = await db.collection('users').findOne({_id: ObjectId (userSession.userId)});
            
        delete user.email;
        delete user.password;
        
        res.send(user);
    } catch (error) {
        res.sendStatus(500)
    }
});

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