const mongoose = require('mongoose');
const express = require("express");
require('dotenv').config();
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My Routes
const authRoutes = require("./routes/auth");
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');


//DB connections
mongoose.connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true
})
.then(()=>{
    console.log("DB CONNECTED!");
}).catch(()=>{
    console.log("DB NOT CONNECTED!");
})

//PORT
const port = process.env.PORT || 8000;

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//My ROutes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

//Starting a Server
app.listen(port, (req, res)=>{
    console.log(`App running on ${port}`);
})

