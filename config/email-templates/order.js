const subject = "Order at Won Games";

const text = `
  Hi <%= user.username %>, thanks for buying at Won Games!
  Follow the info of your order:
  Card Information:
  Card brand: <%= payment.card_brand %>
  Card number: **** **** **** <%= payment.card_last4 %>
  Total: <%= payment.total %>
`;

const html = `
  <p>Hi <%= user.username %>, thanks for buying at Won Games!</p>
  <p>Follow the info of your order:</p>
  <h3>Card Information</h3>
  <ul>
    <li><strong>Card brand:</strong> <%= payment.card_brand %></li>
    <li><strong>Card number:</strong> **** **** **** <%= payment.card_last4 %></li>
  </ul>
  <h3>Total: <%= payment.total %></h3>
`;

module.exports = {
  subject,
  text,
  html
};
