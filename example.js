import express from 'express';
import { phoneValidator, validateRequest, formatPhone } from './index.js';

const app = express();
app.use(express.json());

// Example 1: Basic phone validation for Indian mobile numbers
app.post('/api/register', 
  phoneValidator('phone', { country: 'IN', type: 'mobile' }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'Phone number is valid',
      phone: req.body.phone
    });
  }
);

// Example 2: US phone validation with optional field
app.post('/api/contact', 
  phoneValidator('phone', { country: 'US', type: 'mobile', required: false }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'Contact form submitted',
      phone: req.body.phone || 'No phone provided'
    });
  }
);

// Example 3: Multiple phone number validation
app.post('/api/user', 
  phoneValidator('mobile', { country: 'IN', type: 'mobile' }),
  phoneValidator('landline', { country: 'IN', type: 'landline', required: false }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'User created successfully',
      mobile: req.body.mobile,
      landline: req.body.landline
    });
  }
);

// Example 4: UK phone validation
app.post('/api/uk-contact', 
  phoneValidator('phone', { country: 'UK', type: 'mobile' }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'UK contact created',
      phone: req.body.phone
    });
  }
);

// Example 5: Different formatting options
app.post('/api/format-examples', 
  phoneValidator('phone', { country: 'IN', type: 'mobile', format: 'international' }),
  phoneValidator('nationalPhone', { country: 'IN', type: 'mobile', format: 'national', required: false }),
  phoneValidator('autoPhone', { country: 'US', type: 'mobile', format: 'auto', required: false }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'Phone numbers formatted differently',
      international: req.body.phone,
      national: req.body.nationalPhone,
      auto: req.body.autoPhone
    });
  }
);

// Example 6: Custom formatter
const customFormatter = (phone, country) => `[${country.toUpperCase()}] ${phone}`;
app.post('/api/custom-format', 
  phoneValidator('phone', { 
    country: 'IN', 
    type: 'mobile', 
    format: 'custom',
    customFormatter: customFormatter
  }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'Phone number with custom formatting',
      phone: req.body.phone
    });
  }
);

// Example 7: Standalone formatting endpoint
app.post('/api/format-phone', (req, res) => {
  const { phone, country = 'IN', format = 'auto' } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }
  
  const formatted = formatPhone(phone, country, format);
  
  res.json({
    success: true,
    original: phone,
    formatted: formatted,
    country: country,
    format: format
  });
});

// Example 8: Custom error messages
app.post('/api/custom-errors', 
  phoneValidator('phone', { 
    country: 'IN', 
    type: 'mobile',
    errorMessages: {
      required: 'Please provide your mobile number',
      invalidFormat: 'Mobile number format is incorrect for India',
      empty: 'Mobile number cannot be empty',
      invalid: 'Please provide a valid mobile number'
    }
  }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'Phone number validated with custom error messages',
      phone: req.body.phone
    });
  }
);

// Example 9: Different error messages for different fields
app.post('/api/multiple-errors', 
  phoneValidator('mobile', { 
    country: 'IN', 
    type: 'mobile',
    errorMessages: {
      required: 'Mobile number is mandatory',
      invalidFormat: 'Invalid mobile number format'
    }
  }),
  phoneValidator('landline', { 
    country: 'IN', 
    type: 'landline',
    required: false,
    errorMessages: {
      invalidFormat: 'Invalid landline number format'
    }
  }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      message: 'Multiple phone numbers with different error messages',
      mobile: req.body.mobile,
      landline: req.body.landline
    });
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('\n📱 Test endpoints:');
  console.log('POST /api/register - Indian mobile validation');
  console.log('POST /api/contact - US mobile validation (optional)');
  console.log('POST /api/user - Multiple phone validation');
  console.log('POST /api/uk-contact - UK mobile validation');
  console.log('POST /api/format-examples - Different formatting options');
  console.log('POST /api/custom-format - Custom formatter example');
  console.log('POST /api/format-phone - Standalone formatting');
  console.log('POST /api/custom-errors - Custom error messages');
  console.log('POST /api/multiple-errors - Multiple fields with different errors');
  console.log('\nExample request bodies:');
  console.log('{ "phone": "9876543210" }');
  console.log('{ "phone": "9876543210", "nationalPhone": "9876543210", "autoPhone": "(555) 234-5678" }');
  console.log('{ "phone": "9876543210", "country": "IN", "format": "auto" }');
  console.log('{ "mobile": "9876543210", "landline": "02212345678" }');
});
