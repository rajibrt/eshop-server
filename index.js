const express = require("express");
const app = express();
const products = require("./products.json");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 4000;
require("dotenv").config();
app.use(express.json());

app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nz65omc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized Access' })
    }
    req.decoded = decoded;
    next();
  })
}
async function run() {
  try {
    const productsCollection = client.db("eshop").collection("products");
    const adminCollection = client.db("eshop").collection("admin");
    const product = { name: "OnePlus 10 Pro", brand: "OnePlus" };
    console.log('database connected')
    // const result = await productsCollection.insertOne(product);
    // console.log(result);

    app.get('/admin', async (req, res) => {
      const query = {};
      const allAdmin = await adminCollection.find(query).toArray();
      res.send(allAdmin);
    })

    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await adminCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });

    })

    app.post('/addproduct', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    })

    app.get('/productdetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const selectedMobile = await productsCollection.findOne(query);
      res.send(selectedMobile);
    });

    app.get('/allproducts', async (req, res) => {
      const query = {};
      const allProducts = await productsCollection.find(query).toArray();
      res.send(allProducts);
    })
    app.get('/allproducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const allProducts = await productsCollection.find(query).toArray();
      res.send(allProducts);
    })


    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello from node js");
});

app.get("/products", (req, res) => {
  res.send(products);
});

app.get("/product/:id", (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  const product = products.find((product) => product._id === id) || {};
  res.send(product);
});



app.listen(port, () => {
  console.log(`Server is running at: ${port}`);
});
