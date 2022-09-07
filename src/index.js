import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(MONGO_URI);

let db;
mongoClient.connect().then( () => {
    db = mongoClient.db('mywallet')
});





app.listen(5000, () => {
    console.log('Listening on port  5000')
})