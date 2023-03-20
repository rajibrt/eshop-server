const express = require('express')
const app = express()
const products = require('./products.json')
const cors = require('cors')
const port = process.env.PORT || 4000

app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello from node js')
})

app.get('/products', (req, res) => {
    res.send(products)
})

app.get('/product/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(id)
    const product = products.find(product => product._id === id) || {};
    res.send(product)
})

app.listen(port, () => {
    console.log(`Server is running at: ${port}`)
})

