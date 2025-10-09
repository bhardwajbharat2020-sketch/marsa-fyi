// Test script to verify email configuration
require('dotenv').config({ path: __dirname + '/../.env' });
const nodemailer = require('nodemailer');

console.log('Email config:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);

// Configure email transporter for Hostinger with TLS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // false for TLS (port 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    
    // Verify the connection configuration
    await transporter.verify();
    console.log('Email server is ready to send messages');
    
    // Send a test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email from MarsaFyi',
      text: 'This is a test email to verify the email configuration is working properly.',
      html: '<h1>Test Email</h1><p>This is a test email to verify the email configuration is working properly.</p>'
    });
    
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error with email configuration:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    // Log full error for debugging
    console.error('Full error:', error);
  }
}

testEmail();