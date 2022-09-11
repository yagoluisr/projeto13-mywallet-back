import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
mongoClient.connect().then( () => {
    db = mongoClient.db('mywallet')
});


const userRegisterSchema = joi.object({
    name: joi.string().alphanum().empty().required(),
    email: joi.string().email().empty().required(),
    password: joi.string().alphanum().required(),
    confirmPassword: joi.string().alphanum().required()
});

const userLoginSchema = joi.object({
    email: joi.string().email().empty().required(),
    password: joi.string().alphanum().required()
})


app.post('/sign-up', async (req, res) => {
    const user = req.body;

    if (user.password !== user.confirmPassword) {
        return res.status(400).send(error)
    }

    const validation = userRegisterSchema.validate(user, {abortEarly: false})

    if (validation.error) {
        const error = validation.error.details.map(obj => obj.message )
        return res.status(400).send(error);
    }

    try {
        const userDB = await db.collection('users').findOne({email: user.email});

        if (userDB) {
            return res.status(409).send('Já existe um usuário com esse e-mail');
        }

        const passwordHash = bcrypt.hashSync(toString(user.password), 10);

        const newUser = await db
            .collection('users')
            .insertOne({
                ...user, 
                password: passwordHash, 
                extract: []
            });

        delete newUser.password

        res.status(201).send(newUser);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;

    const validation = userLoginSchema.validate({email, password}, {abortEarly:false})

    if (validation.error) {
            const error = validation.error.details.map( obj => obj.message )
            return res.status(400).send(error)
        }
        
        try {
            const user = await db.collection('users').findOne({email});
            
            if (user && bcrypt.compareSync(toString(password), user.password)) {
                const token = uuid();
            
            await db.collection('sessions').insertOne({
                userId: user._id,
                name: user.name,
                token
            });

            const userSession = await db
                .collection('sessions')
                .findOne(
                    {
                        userId: user._id
                    }
                )
            
            return res.status(200).send(userSession);
        }

        res.sendStatus(404)
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.sendStatus(404);
    
    try {
        const userSession = await db
            .collection('sessions')
            .findOne(
                {
                    token: token
                }
            )
        ;

        if (!userSession) return res.sendStatus(404);
        
        const user = await db
            .collection('users')
            .findOne(
                {
                    _id: ObjectId (userSession.userId)
                }
            )
        ;

        let transactions = user.extract.map(obj => {
            if (obj.type === 'debit') {
                return ({
                    ...obj,
                    value: obj.value * -1
                })
            } else {
                return ({
                    ...obj,
                    value: obj.value * 1
                })
            }
        });
            
        delete user.email;
        delete user.password;
        res.send({
            _id: ObjectId(user._id),
            name: user.name,
            extract: transactions
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/novaentrada', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if(!token) return res.sendStatus(401);

    const newEntry = req.body;

    try {
        const user = await db
            .collection('users')
            .findOne(
                {
                    _id: ObjectId(newEntry.userId)
                }
            )
        ;

        await db
            .collection('users')
            .updateOne({
                _id: ObjectId(newEntry.userId)},
                {$set: { extract: 
                    [ 
                        ...user.extract, 
                        newEntry 
                    ]
                }}
            )
        ;

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message)
    }
});

app.post('/novasaida', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if(!token) return res.sendStatus(401);

    const newEntry = req.body;

    try {
        const user = await db
            .collection('users')
            .findOne(
                {
                    _id: ObjectId(newEntry.userId)
                }
            )
        ;

        await db
        .collection('users')
        .updateOne({
            _id: ObjectId(newEntry.userId)},
            {$set: { extract: 
                [ 
                    ...user.extract, 
                    newEntry 
                ]
            }}
        );

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message)
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