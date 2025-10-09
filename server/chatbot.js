const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const router = express.Router();

// Initialize Gemini AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Platform information for Gemini AI context
const platformContext = `
  MarsaFyi is a port-centric B2B marketplace platform that connects global businesses. Here's what you need to know:

  ABOUT THE PLATFORM:
  - Specializes in trade solutions, supplier verification, customs clearance, and logistics services
  - Helps businesses scale their international trade operations
  - Connects buyers and sellers across continents with trusted partnerships

  REGISTRATION PROCESS:
  - Users click 'Join/Login' button at top right corner
  - Provide business details, contact information, and create secure password
  - Receive confirmation email to verify account
  - Different roles available: buyer, seller, captain, admin, HR, accountant, etc.

  LOGIN PROCESS:
  - Click 'Join/Login' button and enter registered email and password
  - Forgot password option available to reset via email

  BUYING PROCESS:
  - Browse catalog or search for specific items
  - Click 'Request Quote' to submit RFQ to suppliers
  - Compare quotes from multiple suppliers and choose best offer
  - Verified suppliers with KYC audits and ratings

  SELLING PROCESS:
  - Register as a supplier
  - List products with detailed descriptions, images, and pricing
  - Products go through verification process before going live

  SERVICES:
  - Logistics & Shipping: Integrated carriers & tracking
  - Customs Clearance: Documentation & advisory
  - Market Intelligence: Demand data & price signals
  - Supplier Verification: KYC, audits & ratings

  IMPORTANT LIMITATIONS:
  - Cannot access or provide any personal database information
  - Cannot assist with personal account details or specific user data
  - Cannot process transactions or handle payments directly
  - Can only provide general platform information and guidance
  - For specific account issues, users should contact support@marsafyi.com
`;

// Chatbot endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the prompt with context and conversation history
    let prompt = `You are a helpful assistant for MarsaFyi, a B2B marketplace platform. Here's context about the platform: ${platformContext}\n\n`;

    // Add conversation history if available
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        prompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
      });
    }

    // Add the current message
    prompt += `User: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;