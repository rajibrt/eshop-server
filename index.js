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
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const productsCollection = client.db("eshop").collection("products");
    const categoriesCollection = client.db("eshop").collection("categories");
    const brandCollection = client.db("eshop").collection("brand");
    const adminCollection = client.db("eshop").collection("admin");
    console.log("database connected");
    // const result = await productsCollection.insertOne(product);
    // console.log(result);

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.get("/admin", async (req, res) => {
      const query = {};
      const allAdmin = await adminCollection.find(query).toArray();
      res.send(allAdmin);
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await adminCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.post("/category", async (req, res) => {
      const category = req.body;
      const result = await categoriesCollection.insertOne(category);
      res.send(result);
    });
    app.post("/brand", async (req, res) => {
      const brand = req.body;
      const result = await brandCollection.insertOne(brand);
      res.send(result);
    });

    app.put("/editcategory/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const category = req.body;
      const option = { upsert: true };
      const updatedCategory = {
        $set: {
          name: category.name,
          image: category.image,
          description: category.description,
          submissionTime: category.submissionTime,
        },
      };
      const result = await categoriesCollection.updateOne(
        filter,
        updatedCategory,
        option
      );
      res.send(result);
    });
    app.put("/editbrand/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const brand = req.body;
      const option = { upsert: true };
      const updatedBrand = {
        $set: {
          name: brand.name,
          image: brand.image,
          description: brand.description,
          submissionTime: brand.submissionTime,
        },
      };

      const result = await brandCollection.updateOne(
        filter,
        updatedBrand,
        option
      );
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      const query = {};
      const sort = { length: 1, name: 1 };
      const allCategory = await categoriesCollection
        .find(query)
        .sort(sort)
        .toArray();
      res.send(allCategory);
    });

    app.get("/brand", async (req, res) => {
      const query = {};
      const sort = { length: 1, name: 1 };
      const allCategory = await brandCollection
        .find(query)
        .sort(sort)
        .toArray();
      res.send(allCategory);
    });

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const category = await categoriesCollection.findOne(query);
      res.send(category);
    });

    app.get("/brand/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const brand = await brandCollection.findOne(query);
      res.send(brand);
    });

    app.delete("/deletecategory/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Trying to delete", id);
      const query = { _id: new ObjectId(id) };
      const result = await categoriesCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    app.delete("/deletebrand/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Trying to delete", id);
      const query = { _id: new ObjectId(id) };
      const result = await brandCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    app.get("/latestProducts", async (req, res) => {
      const query = {};
      const sort = { length: 1, submissionTime: -1 };
      const limit = 8;
      const latestSixProducts = await productsCollection
        .find(query)
        .sort(sort)
        .limit(limit)
        .toArray();
      res.send(latestSixProducts);
    });

    app.post("/addproduct", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/productdetails/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    app.get("/allproducts", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const skip = page * size;
      console.log('Page No', page, 'Size', size);
      const query = {};
      const sort = { length: 1, submissionTime: -1 };
      const cursor = productsCollection.find(query);
      // const allProducts = await cursor.skip(page * size).limit(size).toArray();
      const allProducts = await cursor.skip(skip).limit(size).sort(sort).toArray();
      const count = await productsCollection.estimatedDocumentCount();
      res.send({ count, allProducts });
    });

    // app.get("/allproducts/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: id };
    //   const allProducts = await productsCollection.find(query).toArray();
    //   res.send(allProducts);
    // });

    app.get("/product/:id", (req, res) => {
      const id = req.params.id;
      console.log(id);
      const product =
        productsCollection.find((product) => product._id === id) || {};
      res.send(product);
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
