import React, { useEffect, useMemo, useState } from "react";
import Reactsvg from "./assets/react.svg";
import axios from "axios";

function App() {
  const [subscriptionData, setSubscriptionData] = useState({
    annual: [],
    monthly: [],
  });

  const [subscriptionId, setSubscriptionId] = useState("");

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  // for one time purchases
  async function displayRazorpay(planId) {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const result = await axios.post("http://localhost:5000/payment/orders", {
      planId,
    });

    if (!result) {
      alert("Server error. Are you online?");
      return;
    }

    const { amount, id: order_id, currency } = result.data;

    const options = {
      key: "rzp_test_1Ieh11Ky0lU1aJ", // Enter the Key ID generated from the Dashboard
      amount: amount.toString(),
      currency: currency,
      name: "Team Shiksha.",
      description: "Test Transaction",
      image: Reactsvg,
      order_id: order_id,
      handler: async function (response) {
        const data = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };
        try {
          const result = await axios.post(
            "http://localhost:5000/payment/success",
            data
          );
          console.log("result", result);
        } catch (err) {
          console.log("errOR: ", err);
        }

        alert(result.data.status);
      },
      prefill: {
        name: "username",
        email: "logoexec@gmail.com",
        contact: "7506327224",
      },
      notes: {
        address: "LogoExecutive",
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  // for recurring transactions/ subscription
  async function displayRazorpaysub(planId) {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const result = await axios.post("http://localhost:5000/payment/subscribe", {
      planId,
    });
    // if (result) {
    //   console.log("hi");

    //   const { short_url: url } = result.data;
    //   window.open(url, "_blank");
    //   return;
    // }

    if (!result) {
      alert("Server error. Are you online?");
      return;
    }

    const { id: subscription_id } = result.data;

    console.log("result.data", result.data);

    const options = {
      key: "rzp_test_1Ieh11Ky0lU1aJ", // Enter the Key ID generated from the Dashboard
      subscription_id: subscription_id,
      name: "Team Shiksha.",
      description: "Test Transaction",
      image: Reactsvg,
      handler: async function (response) {
        console.log("handlerdata", response);

        const data = {
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySubscriptionId: response.razorpay_subscription_id,
          razorpaySignature: response.razorpay_signature,
        };
        try {
          const result = await axios.post(
            "http://localhost:5000/payment/sub-success",
            data
          );
          console.log("result", result);
        } catch (err) {
          console.log("errOR: ", err);
        }

        alert(result.data.status);
      },
      // prefill: {
      //   name: "username",
      //   email: "logoexec@gmail.com",
      //   contact: "7506327224",
      // },
      notes: {
        address: "LogoExecutive",
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }
  async function fetchSubscriptions(planId) {
    try {
      const res = await axios.post(
        "http://localhost:5000/payment/fetch-subscription",
        {
          planId,
        }
      );
      if (planId.includes("annual")) {
        setSubscriptionData((prev) => ({
          ...prev,
          annual: res.data.items,
        }));
      } else {
        setSubscriptionData((prev) => ({
          ...prev,
          monthly: res.data.items,
        }));
      }

      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }

  // async function fetchSpecificSubscription(e) {
  //   e.preventDefault();
  // }

  async function fetchAllplans() {}

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Logoexecutive
          </h2>
        </div>

        <div className="mb-6">
          <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
            {/* <PricingCard
              title="Basic"
              price="200"
              features={[
                "1 user",
                "100 queries",
                "Email support",
                "Basic analytics",
              ]}
              onClick={() => displayRazorpaysub("basic")}
            />
            <PricingCard
              title="Pro"
              price="500"
              features={[
                "5 users",
                "500 queries",
                "Priority email support",
                "Advanced analytics",
              ]}
              onClick={() => displayRazorpay("pro")}
            /> */}
            {/* <PricingCard
              title="Premium"
              price="2000"
              features={[
                "Unlimited users",
                "Unlimited queries",
                "24/7 phone & email support",
                "Enterprise analytics",
              ]}
              onClick={() => displayRazorpay("premium")}
            /> */}
            <PricingCard
              title="Annual Pro"
              price="19200"
              billing="Annual"
              onClick={() => displayRazorpaysub("annualPro")}
            />
            <PricingCard
              title="Monthly pro"
              price="1600"
              billing="Monthly"
              onClick={() => displayRazorpaysub("monthlyPro")}
            />
          </div>
        </div>

        <section>
          <h3 className="text-white font-bold text-3xl text-center">
            Subscription Details
          </h3>
          <div className="mt-8 text-white">
            <button
              className="px-4 py-2 mb-6 rounded-lg bg-zinc-600 hover:bg-zinc-800"
              onClick={() => fetchSubscriptions("annualPro")}
            >
              Fetch Annual Subscription
            </button>
            {subscriptionData?.annual?.length > 0 ? (
              <SubscriptionTable items={subscriptionData.annual} />
            ) : (
              <p>No subscriptions found</p>
            )}
          </div>
          <div className="mt-8 text-white">
            <button
              className="px-4 py-2 mb-6 rounded-lg bg-zinc-600 hover:bg-zinc-800"
              onClick={() => fetchSubscriptions("monthlyPro")}
            >
              Fetch Monthly subscription
            </button>
            {subscriptionData?.monthly?.length > 0 ? (
              <SubscriptionTable items={subscriptionData.monthly} />
            ) : (
              <p>No subscriptions found</p>
            )}
          </div>
        </section>

        {/* <section>
          <h3 className="text-white font-bold text-3xl mt-16 text-center">
            Fetch specific Subscription Details
          </h3>
          <form onSubmit={fetchSpecificSubscription}>
            <input
              type="text"
              value={subscriptionId}
              onChange={(e) => {
                setSubscriptionId(e.target.value);
              }}
            />
            <button className=" ml-4 px-2 py-1 bg-white " type="submit">
              Fetch
            </button>
          </form>
        </section> */}
      </div>
    </div>
  );
}

const PricingCard = ({ title, price, billing, onClick }) => (
  <div className="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
    <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
    <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
      Best option for {title.toLowerCase()} usage
    </p>
    <div className="flex justify-center items-baseline my-8">
      <span className="mr-2 text-2xl font-extrabold">₹{price}</span>
      <span className="text-gray-500 dark:text-gray-400">{billing}</span>
    </div>
    <button
      onClick={onClick}
      className="text-white bg-zinc-600 hover:bg-zinc-700 focus:ring-4 focus:ring-zinc-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-zinc-900"
    >
      Subscribe
    </button>
  </div>
);

const SubscriptionTable = ({ items }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto bg-gray-800 text-white">
        <thead>
          <tr className="bg-gray-700 text-gray-200">
            <th className="px-4 py-2">Subscription ID</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Plan ID</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Current Start</th>
            <th className="px-4 py-2">Current End</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-600 hover:bg-gray-700"
            >
              <td className="px-4 py-2 border-l border-gray-600">{item.id}</td>
              <td className="px-4 py-2 border-l border-gray-600">
                {item.status}
              </td>
              <td className="px-4 py-2 border-l border-gray-600">
                {item.plan_id}
              </td>
              <td className="px-4 py-2 border-l border-gray-600">
                {item.quantity}
              </td>
              <td className="px-4 py-2 border-l border-gray-600">
                {formatTimestamp(item.current_start)}
              </td>
              <td className="px-4 py-2 border-l border-gray-600">
                {formatTimestamp(item.current_end)}
              </td>
              <td className="px-4 py-2 border-l border-gray-600">
                {formatTimestamp(item.created_at)}
              </td>
              <td className="px-4 py-2 border-l border-gray-600">
                {item.payment_method}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

export default App;
