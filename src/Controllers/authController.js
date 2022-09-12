import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import mongo from '../db/db.js';


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

let db = await mongo();

async function signIn (req, res) {
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
}

async function signUp (req, res) {
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
            
            await db
                .collection('sessions')
                .insertOne(
                    {
                        userId: user._id,
                        name: user.name,
                        token,
                        lastStatus: Date.now()
                    }
                )
            ;

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
}

export { signIn, signUp }