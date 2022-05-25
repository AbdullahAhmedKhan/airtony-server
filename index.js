const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-airtony.ezd7o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
}



async function run() {
    try {
        await client.connect();
        const partsCollection = client.db("airtony").collection("parts");
        const placeOrderCollection = client.db("airtony").collection("placeOrder");


        // get all parts
        app.get('/part', async (req, res) => {
            const query = {}
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts)
        });

        // get one inventory item
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const part = await partsCollection.findOne(query);
            res.send(part);
        });

        // send database order info
        app.post("/placeorder", async (req, res) => {
            const placeOrder = req.body;
            const result = await placeOrderCollection.insertOne(placeOrder);
            res.send(result);
        });

        // get single user order info
        app.get('/placeorder', async (req, res) => {
            const customerEmail = req.query.email;
            const query = { customerEmail: customerEmail };
            const orders = await placeOrderCollection.find(query).toArray();
            res.send(orders);
        })

        // 
        // app.delete('/doctor/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email: email };
        //     const result = await doctorCollection.deleteOne(filter);
        //     res.send(result);
        // })
    }

    finally {

    }



}

run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello from airtony!');
})


app.listen(port, () => {
    console.log(`Airtony app listening: ${port}`);
})
