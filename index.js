const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ucdi4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const itemCollection = client.db('WhereIsIt').collection('lost_found_items')
    const recoveredItemCollection = client.db('WhereIsIt').collection('recovered_items')

    app.post('/items', async(req, res) => {
      const newItem = req.body;
      const result = await itemCollection.insertOne(newItem)
      res.send(result)
    })

    app.get('/items', async(req, res) => {
      const cursor = itemCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/items/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await itemCollection.findOne(query)
      res.send(result)
    })


    // recovered items APIs

    app.post('/items/:id', async(req,res) => {

      // create new data on new collection
      const newRecoveredItem = req.body;
      const resultPost = await recoveredItemCollection.insertOne(newRecoveredItem)

      // update existing data on other collection
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const updatedDoc = {
        $set: {
          status: "recovered"
        }
      }
      const resultUpdate = await itemCollection.updateOne(query, updatedDoc);
      res.send(resultUpdate)
    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('WhereIsIt server is running')
})

app.listen(port, () => {
    console.log(`WhereIsIt Server is running on port: ${port}`)
})

/* 





*/