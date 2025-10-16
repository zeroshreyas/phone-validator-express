# Phone Validator Express

A comprehensive phone number validation package with Express.js middleware support. Validate phone numbers from multiple countries with proper formatting and error handling.

## Features

- 🌍 **Multi-country support** - India, US, UK, and more
- 📱 **Multiple phone types** - Mobile, landline, or any
- 🔧 **Express.js middleware** - Easy integration with Express applications
- ✨ **Flexible formatting** - Choose from multiple format options or create custom formatters
- 🎨 **Developer control** - Override default formatting with custom functions
- 📋 **Format placeholders** - Built-in format examples to help developers understand expected formats
- 🛡️ **Type safety** - Built with modern JavaScript (ES6+)
- 🧪 **Comprehensive testing** - Full test coverage included

## Installation

```bash
npm install phone-validator-express
```

## Quick Start

### Basic Usage

```javascript
import { validatePhoneNumber, formatPhone, getFormatPlaceholder, getFormatExamples } from 'phone-validator-express';

// Validate an Indian mobile number
const result = validatePhoneNumber('9876543210', 'IN', 'mobile');
console.log(result);
// Output: { isValid: true, error: null, formatted: '+919876543210' }

// Get format placeholders to help users
const placeholder = getFormatPlaceholder('IN', 'mobile');
console.log(placeholder); // '9876543210'

const examples = getFormatExamples('IN', 'mobile');
console.log(examples); // ['9876543210', '+919876543210']

// Format phone numbers with different options
const international = formatPhone('9876543210', 'IN', 'international');
console.log(international); // '+919876543210'

const national = formatPhone('9876543210', 'IN', 'national');
console.log(national); // '9876543210'

const auto = formatPhone('9876543210', 'IN', 'auto');
console.log(auto); // '+91 9876543210'

// Custom formatter
const custom = formatPhone('9876543210', 'IN', 'custom', (phone, country) => `[${country}] ${phone}`);
console.log(custom); // '[IN] +919876543210'
```

### Express.js Middleware

```javascript
import express from 'express';
import { phoneValidator, validateRequest } from 'phone-validator-express';

const app = express();
app.use(express.json());

// Basic validation with auto-formatting
app.post('/api/register', 
  phoneValidator('phone', { country: 'IN', type: 'mobile' }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      phone: req.body.phone // Automatically formatted
    });
  }
);

// Different formatting options
app.post('/api/contact', 
  phoneValidator('phone', { country: 'IN', type: 'mobile', format: 'international' }),
  phoneValidator('nationalPhone', { country: 'IN', type: 'mobile', format: 'national', required: false }),
  validateRequest,
  (req, res) => {
    res.json({
      success: true,
      international: req.body.phone, // '+919876543210'
      national: req.body.nationalPhone // '9876543210'
    });
  }
);

// Custom formatter
const customFormatter = (phone, country) => `[${country.toUpperCase()}] ${phone}`;
app.post('/api/custom', 
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
      phone: req.body.phone // '[IN] +919876543210'
    });
  }
);

// Custom error messages
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
      phone: req.body.phone
    });
  }
);

// Different error messages for different fields
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
      mobile: req.body.mobile,
      landline: req.body.landline
    });
  }
);
```

## API Reference

### `validatePhoneNumber(phoneNumber, country, type)`

Validates a phone number for a specific country and type.

**Parameters:**
- `phoneNumber` (string): The phone number to validate
- `country` (string): Country code ('IN', 'US', 'UK', etc.)
- `type` (string): Phone type ('mobile', 'landline', 'any')

**Returns:**
```javascript
{
  isValid: boolean,
  error: string | null,
  formatted: string | null
}
```

### `phoneValidator(fieldName, options)`

Creates Express.js middleware for phone number validation.

**Parameters:**
- `fieldName` (string): Name of the field to validate
- `options` (object): Validation options
  - `country` (string): Country code (default: 'IN')
  - `type` (string): Phone type (default: 'mobile')
  - `required` (boolean): Whether field is required (default: true)
  - `customMessage` (string): Custom error message (legacy - use errorMessages instead)
  - `format` (string): Format type - 'auto', 'international', 'national', 'raw', 'custom' (default: 'auto')
  - `customFormatter` (function): Custom formatting function (required when format: 'custom')
  - `errorMessages` (object): Custom error messages for different scenarios
    - `required` (string): Error when field is required but missing
    - `invalidFormat` (string): Error when phone format is invalid
    - `invalidLength` (string): Error when phone length is invalid
    - `empty` (string): Error when field is empty/whitespace
    - `invalid` (string): Generic invalid error message

**Returns:** Array of Express.js middleware functions

### `formatPhone(phoneNumber, country, format, customFormatter)`

Formats a phone number with specified options.

**Parameters:**
- `phoneNumber` (string): Phone number to format
- `country` (string): Country code (default: 'IN')
- `format` (string): Format type - 'auto', 'international', 'national', 'raw', 'custom' (default: 'auto')
- `customFormatter` (function): Custom formatting function (required when format: 'custom')

**Returns:** Formatted phone number string

### `getFormatPlaceholder(country, type)`

Gets the format placeholder for a specific country and phone type.

**Parameters:**
- `country` (string): Country code
- `type` (string): Phone type - 'mobile', 'landline' (default: 'mobile')

**Returns:** Format placeholder string or null

### `getFormatExamples(country, type)`

Gets format examples for a specific country and phone type.

**Parameters:**
- `country` (string): Country code
- `type` (string): Phone type - 'mobile', 'landline' (default: 'mobile')

**Returns:** Array of format examples or null

### `getCountryFormatInfo(country)`

Gets all format information for a specific country.

**Parameters:**
- `country` (string): Country code

**Returns:** Object with placeholders and examples or null

### `validateRequest(req, res, next)`

Express.js middleware to handle validation results.

### `getSupportedCountries()`

Returns an array of supported country codes.

### `getPhonePatterns(country)`

Returns phone patterns for a specific country.

## Supported Countries

| Country | Code | Mobile | Landline | Country Code | Mobile Format | Landline Format |
|---------|------|--------|----------|--------------|---------------|-----------------|
| India   | IN   | ✅     | ✅       | +91          | 9876543210    | 02212345678     |
| United States | US | ✅     | ❌       | +1           | (555) 234-5678 | (555) 123-4567  |
| United Kingdom | UK | ✅   | ✅       | +44          | 07123456789   | 02012345678     |

## Enhanced Error Messages

The phone validator now includes format placeholders in error messages to help developers understand the expected format:

### Default Error Messages with Placeholders

```javascript
// Indian mobile validation
phoneValidator('phone', { country: 'IN', type: 'mobile' })

// Error messages will include:
// "Invalid mobile phone number for IN. Expected format: 9876543210 Examples: 9876543210, +919876543210"
```

### Using Format Information

```javascript
import { getFormatPlaceholder, getFormatExamples, getCountryFormatInfo } from 'phone-validator-express';

// Get format placeholder
const placeholder = getFormatPlaceholder('IN', 'mobile');
console.log(placeholder); // '9876543210'

// Get format examples
const examples = getFormatExamples('US', 'mobile');
console.log(examples); // ['(555) 234-5678', '555-234-5678', '5552345678', '+15552345678']

// Get all format info for a country
const info = getCountryFormatInfo('UK');
console.log(info);
// {
//   mobile: '07123456789',
//   landline: '02012345678',
//   examples: {
//     mobile: ['07123456789', '+447123456789'],
//     landline: ['02012345678', '+442012345678']
//   }
// }
```

## Usage Examples

### 1. Basic Validation

```javascript
import { validatePhoneNumber } from 'phone-validator-express';

// Indian mobile
const indianMobile = validatePhoneNumber('9876543210', 'IN', 'mobile');
console.log(indianMobile.isValid); // true
console.log(indianMobile.formatted); // '+919876543210'

// US mobile
const usMobile = validatePhoneNumber('555-123-4567', 'US', 'mobile');
console.log(usMobile.isValid); // true
console.log(usMobile.formatted); // '+15551234567'

// UK mobile
const ukMobile = validatePhoneNumber('07123456789', 'UK', 'mobile');
console.log(ukMobile.isValid); // true
console.log(ukMobile.formatted); // '+447123456789'
```

### 2. Express.js Integration

```javascript
import express from 'express';
import { phoneValidator, validateRequest } from 'phone-validator-express';

const app = express();
app.use(express.json());

// Single phone validation
app.post('/api/contact', 
  phoneValidator('phone', { country: 'IN', type: 'mobile' }),
  validateRequest,
  (req, res) => {
    res.json({ success: true, phone: req.body.phone });
  }
);

// Multiple phone validation
app.post('/api/user', 
  phoneValidator('mobile', { country: 'IN', type: 'mobile' }),
  phoneValidator('landline', { country: 'IN', type: 'landline', required: false }),
  validateRequest,
  (req, res) => {
    res.json({ 
      success: true, 
      mobile: req.body.mobile,
      landline: req.body.landline 
    });
  }
);

// Optional phone validation
app.post('/api/profile', 
  phoneValidator('phone', { country: 'US', type: 'mobile', required: false }),
  validateRequest,
  (req, res) => {
    res.json({ 
      success: true, 
      phone: req.body.phone || 'No phone provided' 
    });
  }
);
```

### 3. Error Handling

```javascript
app.post('/api/register', 
  phoneValidator('phone', { country: 'IN', type: 'mobile' }),
  validateRequest,
  (req, res) => {
    res.json({ success: true, phone: req.body.phone });
  }
);

// If validation fails, returns:
// {
//   "status": "error",
//   "message": "Validation failed",
//   "errors": [
//     {
//       "field": "phone",
//       "msg": "Invalid mobile phone number for IN",
//       "value": "1234567890",
//       "location": "body"
//     }
//   ]
// }
```

## Testing

Run the included tests:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0
- Initial release
- Support for India, US, and UK phone numbers
- Express.js middleware integration
- Comprehensive test suite
- Auto-formatting of valid phone numbers
