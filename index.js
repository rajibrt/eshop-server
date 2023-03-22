const express = require('express')
const app = express()
const products = require('./products.json')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb')
const port = process.env.PORT || 4000

app.use(cors())

const uri =
  'mongodb+srv://raishahost:JEAb2CJ6ksRA7p2N@cluster0.nz65omc.mongodb.net/?retryWrites=true&w=majority'
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})
async function run() {
  try {
    const productsCollection = client.db('eshop').collection('products')
    const product = { name: 'OnePlus 10 Pro', brand: 'OnePlus' }
    const result = await productsCollection.insertOne(product)
    console.log(result)
  } finally {
  }
}

run().catch((err) => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello from node js')
})

app.get('/products', (req, res) => {
  res.send(products)
})

app.get('/product/:id', (req, res) => {
  const id = parseInt(req.params.id)
  console.log(id)
  const product = products.find((product) => product._id === id) || {}
  res.send(product)
})

app.listen(port, () => {
  console.log(`Server is running at: ${port}`)
})
