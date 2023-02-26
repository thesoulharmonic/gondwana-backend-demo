const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
require('./connection')
const server = http.createServer(app);
const {Server} = require('socket.io');

const io = new Server(server, {
  cors: 'https://gondwana-demo.onrender.com/',
  methods: ['GET', 'POST', 'PATCH', "DELETE"]
})


// import product routes

const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const imageRoutes = require('./routes/imageRoutes');

// use packages and rouets

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/images', imageRoutes);


app.post('/create-payment', async(req, res)=> {
  const {amount} = req.body; // extract amount from body
  console.log(amount);
  try {
  const paymentIntent = await stripe.paymentIntents.create({ // create payment intent with Stripe API
  amount, // set payment amount
  currency: 'usd', // set currency 
  payment_method_types: ['card'] // specify payment method 
  });
  res.status(200).json(paymentIntent) // send payment intent data as JSON response
  } catch (e) {
  console.log(e.message);
  res.status(400).json(e.message); 
  }
  })

server.listen(8080, ()=> {
  console.log('server running at port', 8080)
})

app.set('socketio', io);
