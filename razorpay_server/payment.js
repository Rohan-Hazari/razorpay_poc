require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const plans = {
  // amount in smallest currency unit for this its paise
  basic: {
    plan_id: process.env.RAZORPAY_BASIC_PLAN,
  },
  pro: {
    plan_id: process.env.RAZORPAY_PRO_PLAN,
  },
  premium: {
    plan_id: process.env.RAZORPAY_PRO_PLAN,
  },
  annualPro: {
    plan_id: process.env.RAZORPAY_ANNUALLY_PRO_PLAN,
  },
  monthlyPro: {
    plan_id: process.env.RAZORPAY_MONTHLY_PRO_PLAN,
  },
};

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/fetch-subscription", async (req, res) => {
  const { planId } = req.body;
  const plan = plans[planId];

  try {
    const options = {
      plan_id: plan.plan_id,
    };
    const subscription = await instance.subscriptions.all(options);
    console.log(options);

    return res.json(subscription);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/subscribe", async (req, res) => {
  const { planId } = req.body;
  const plan = plans[planId];
  console.log(plan);

  try {
    const options = {
      plan_id: plan.plan_id,
      total_count: 1,
    };

    const subscription = await instance.subscriptions.create(options);

    return res.json(subscription);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/sub-success", async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } =
      req.body;

    if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
      console.error("Missing required fields in request body");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not set");
      return res.status(500).json({ error: "Internal server error" });
    }

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpayPaymentId}|${razorpaySubscriptionId}`);
    const digest = shasum.digest("hex");

    console.log("Generated digest:", digest);
    console.log("Received signature:", razorpaySignature);

    if (digest !== razorpaySignature) {
      console.error("Signature verification failed");
      return res.status(400).json({ error: "Transaction not legitimate" });
    }

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

    console.log("Payment verified successfully");
    res.json({
      status: "success",
      message: "Payment verified successfully",
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error("Error in /success route:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/success", async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    if (
      !orderCreationId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      console.error("Missing required fields in request body");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not set");
      return res.status(500).json({ error: "Internal server error" });
    }

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    console.log("Generated digest:", digest);
    console.log("Received signature:", razorpaySignature);

    if (digest !== razorpaySignature) {
      console.error("Signature verification failed");
      return res.status(400).json({ error: "Transaction not legitimate" });
    }

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

    console.log("Payment verified successfully");
    res.json({
      status: "success",
      message: "Payment verified successfully",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error("Error in /success route:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});
router.post("/orders", async (req, res) => {
  const { planId } = req.body;
  console.log(req.body);

  const plan = plans[planId];

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: plan.price,
      currency: "INR",
      receipt: "receipt_order_" + Math.random().toString(36).substring(5),
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
