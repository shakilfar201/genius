const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g3sna.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('lipsticks');
        const productsCollection = database.collection('lips-products');
        const bookingCollection = database.collection('bookingInfo');
        const userinfoCollection = database.collection('userinfo');
        const reviewCollection = database.collection('review');
        const carmodelCollection = database.collection('carmodel');


        // All product
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const result = await cursor.toArray();
            res.json(result)
        });

        app.get('/booking', async (req, res) => {
            const cursor = bookingCollection.find({})
            const result = await cursor.toArray();
            res.json(result)
        });

        // get all car
        app.get('/carmodel', async (req, res) => {
            const cursor = carmodelCollection.find({})
            const result = await cursor.toArray();
            res.json(result)
        });

        // Add products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result)
        });

        // Add Cars
        app.post('/carmodel', async (req, res) => {
            const car = req.body;
            const result = await carmodelCollection.insertOne(car);
            res.json(result)
        });

        // product delete
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const order = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(order);
            res.json(result)
        });

        // Car delete
        app.delete('/carmodel/:id', async (req, res) => {
            const id = req.params.id;
            const order = { _id: ObjectId(id) };
            const result = await carmodelCollection.deleteOne(order);
            res.json(result)
        });

        // single Product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const product = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(product);
            res.json(result)
        });

        app.get('/booking/invoice/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const product = { _id: ObjectId(id) };
            const result = await bookingCollection.findOne(product);
            res.json(result)
        });

        // Booking Info
        app.post('/booking', async (req, res) => {
            const products = req.body;
            const result = await bookingCollection.insertOne(products);
            // console.log(result);
            res.json(result)
        });

        // show Booking info by email
        app.get('/booking/email', async (req, res) => {
            const email = req.query.email;
            console.log(email)
            const query = { email: email };
            const cursor = bookingCollection.find(query);
            const result = await cursor.toArray();
            res.json(result)
        });

        app.put('/booking/date', async (req, res) => {
            const date = req.body;
            var orderDate = {
                date: {
                    $gte: new Date(date.form).toLocaleDateString(),
                    $lt: new Date(date.to).toLocaleDateString()
                }
            }
            const cursor = bookingCollection.find(orderDate);
            const result = await cursor.toArray();
            res.json(result)
        });

        // Update Booking
        app.put('/booking', async (req, res) => {
            const user = req.body;
            const filter = { token: user.token };
            const updateDoc = { $set: { status: 'confirm', taka: user.taka, service: user.value } };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // update INventory
        app.put('/products/quantity', async (req, res) => {
            const value = req.body;
            const filter = { price: value.update }
            const updateDoc = { $set: { instock: value.stock } }
            const result = await productsCollection.updateOne(filter, updateDoc);
            res.json(result)
        });

        // show Booking Delete
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const order = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(order);
            // console.log(result)
            res.json(result)
        })

        // register information
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await userinfoCollection.insertOne(users)
            // console.log(result)
            res.json(result)
        })

        // update information
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userinfoCollection.updateOne(filter, updateDoc, options,)
            res.json(result)
        })

        // search admin user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = { email: email };
            const user = await userinfoCollection.findOne(query);
            // console.log(result)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // Make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userinfoCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // show all booking
        app.get('/booking/:id', async (req, res) => {
            const id = req.query.productId;
            console.log(id)
            const order = { productId: id };
            const cursor = bookingCollection.find(order);
            const result = await cursor.toArray();
            res.json(result)
        });

        app.post('/review', async (req, res) => {
            const body = req.body;
            const result = await reviewCollection.insertOne(body)
            res.json(result)
        })

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('connect')
});

app.listen(port, () => {
    console.log('listennng to the port', port)
})