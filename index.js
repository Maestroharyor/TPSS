const express = require("express");
const cors = require("cors");
// const expressValidator = require('express-validator');
const {split_payment} = require('./controllers/splitPaymentController')
const {validate} = require('./middlewares/dataValidator')


const app = express();

//Midddlewares
app.use(cors());
app.use(express.json());
// app.use(expressValidator())


//Starting server
app.listen(process.env.port || 3050, () => {
    console.log("Now Listening for requests");
  });


//Routes Handler
app.post("/split-payments/compute", validate, split_payment);

app.use("*", (req, res) => {
  res.status(404).send("Error 404");
});