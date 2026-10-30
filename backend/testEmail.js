
require("dotenv").config();

const sendEmail = require("./config/email");

async function testEmail() {
  try {
    console.log("Email account:", process.env.EMAIL_USER);
    console.log("Password configured:", Boolean(process.env.EMAIL_PASS));

    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "DALALX Email Test",
      text: "Your DALALX email notification system is working!"
    });

    console.log("SUCCESS: Test email sent!");
  } catch (error) {
    console.error("EMAIL TEST FAILED");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
  }
}

testEmail();
