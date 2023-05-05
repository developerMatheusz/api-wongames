module.exports = {
  routes: [
    {
      method: "POST",
      path: "/orders/create-payment-intent",
      handler: "order.createPaymentIntent"
    },
    {
      method: "POST",
      path: "/orders",
      handler: "order.create"
    }
  ]
};
