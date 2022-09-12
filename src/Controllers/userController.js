import { ObjectId } from 'mongodb';
import mongo from '../db/db.js';

let db = await mongo();

async function getUserData (req, res) {
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
}

async function insertEntry (req, res){
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
}

async function insertOutput (req, res) {
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
}

export { getUserData, insertEntry, insertOutput }