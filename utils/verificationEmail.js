const sgMail = require("@sendgrid/mail");

const verificationEmail = async (name, email, verificationToken) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const link = `http://localhost:4200/verification?email=${email}&token=${verificationToken}`;

  const message = `<p>Please confirm your email by clicking on the following link: 
  </p><a href="${link}">Link to verification!</a>`;

  const msg = {
    to: "skubo89@yahoo.com", // Change to your recipient
    from: "subotic.dejan89@gmail.com", // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    html: `<h4>Hello, ${name}</h4> ${message}`,
  };

  await sgMail.send(msg);
};

module.exports = verificationEmail;
