// Simple test script to debug Twilio integration
const express = require('express');
const app = express();

// Middleware to parse Twilio webhook data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Test endpoint that mimics Twilio voice webhook
app.post('/api/twilio/voice', (req, res) => {
  console.log('🔍 Received Twilio webhook:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Return simple TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">This is a test. Your Twilio integration is working!</Say>
  <Hangup/>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
  console.log('✅ Sent TwiML response');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

const PORT = 3002; // Different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`Use this for testing: http://localhost:${PORT}/api/twilio/voice`);
});
