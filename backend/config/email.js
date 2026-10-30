
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing");
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is missing");
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html
    });

    if (error) {
      console.error("RESEND EMAIL ERROR:", error);
      throw new Error(error.message || "Resend failed");
    }

    console.log("DALALX RESEND EMAIL SENT:", data?.id);
    return data;

  } catch (error) {
    console.error("DALALX EMAIL DELIVERY FAILED:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
