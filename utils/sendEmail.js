const SibApiV3Sdk = require("sib-api-v3-sdk");
const axios = require("axios");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      sender: {
        name: "Bigwig Media Digital",
        email: "devashish@bigwigmedia.in",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      attachment: attachments, // 👈 THIS is the key
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Email sent to ${to} successfully via Brevo`);
  } catch (error) {
    console.error("❌ Failed to send email via Brevo:", error);
  }
};

module.exports = sendEmail;
