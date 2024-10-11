const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ extended: false }));
app.use(cors());

const paymentRoutes = require("./payment");

app.use("/payment", paymentRoutes);

app.listen(port, () => console.log(`server started on port ${port}`));
