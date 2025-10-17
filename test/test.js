import { 
  validatePhoneNumber, 
  phoneValidator, 
  formatPhone,
  getSupportedCountries, 
  getPhonePatterns,
  getFormatPlaceholder,
  getFormatExamples,
  getCountryFormatInfo
} from '../index.js';

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let passedTests = 0;
let totalTests = 0;

function test(description, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`${colors.green}✓${colors.reset} ${description}`);
      passedTests++;
    } else {
      console.log(`${colors.red}✗${colors.reset} ${description}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${description} - Error: ${error.message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected: ${expected}, Got: ${actual}`);
  }
  return true;
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`${message}. Expected true, got false`);
  }
  return true;
}

console.log(`${colors.bold}${colors.yellow}🧪 Running Phone Validator Tests${colors.reset}\n`);

// Test validatePhoneNumber function
console.log(`${colors.bold}Testing validatePhoneNumber function:${colors.reset}`);

// India mobile tests
test('Indian mobile number validation - valid', () => {
  const result = validatePhoneNumber('9876543210', 'IN', 'mobile');
  return assertTrue(result.isValid, 'Should be valid') && 
         assertEqual(result.formatted, '+919876543210', 'Should format correctly');
});

test('Indian mobile number validation - invalid', () => {
  const result = validatePhoneNumber('1234567890', 'IN', 'mobile');
  return assertTrue(!result.isValid, 'Should be invalid');
});

test('Indian mobile number with country code', () => {
  const result = validatePhoneNumber('+919876543210', 'IN', 'mobile');
  return assertTrue(result.isValid, 'Should be valid with country code');
});

// US mobile tests
test('US mobile number validation - valid', () => {
  const result = validatePhoneNumber('(555) 234-5678', 'US', 'mobile');
  return assertTrue(result.isValid, 'Should be valid');
});

test('US mobile number validation - invalid', () => {
  const result = validatePhoneNumber('123-456-7890', 'US', 'mobile');
  return assertTrue(!result.isValid, 'Should be invalid (starts with 1)');
});

// UK mobile tests
test('UK mobile number validation - valid', () => {
  const result = validatePhoneNumber('07123456789', 'UK', 'mobile');
  return assertTrue(result.isValid, 'Should be valid');
});

test('UK mobile number with country code', () => {
  const result = validatePhoneNumber('+447123456789', 'UK', 'mobile');
  return assertTrue(result.isValid, 'Should be valid with country code');
});

// Edge cases
test('Empty phone number', () => {
  const result = validatePhoneNumber('', 'IN', 'mobile');
  return assertTrue(!result.isValid, 'Empty string should be invalid');
});

test('Null phone number', () => {
  const result = validatePhoneNumber(null, 'IN', 'mobile');
  return assertTrue(!result.isValid, 'Null should be invalid');
});

test('Invalid country code', () => {
  const result = validatePhoneNumber('1234567890', 'XX', 'mobile');
  return assertTrue(!result.isValid, 'Invalid country should be invalid');
});

// Test utility functions
console.log(`\n${colors.bold}Testing utility functions:${colors.reset}`);

test('Get supported countries', () => {
  const countries = getSupportedCountries();
  return assertTrue(countries.includes('IN'), 'Should include India') &&
         assertTrue(countries.includes('US'), 'Should include US') &&
         assertTrue(countries.includes('UK'), 'Should include UK');
});

test('Get phone patterns for India', () => {
  const patterns = getPhonePatterns('IN');
  return assertTrue(patterns !== null, 'Should return patterns for India') &&
         assertTrue(patterns.mobile !== undefined, 'Should have mobile pattern');
});

test('Get phone patterns for invalid country', () => {
  const patterns = getPhonePatterns('XX');
  return assertTrue(patterns === null, 'Should return null for invalid country');
});

// Test phoneValidator middleware creation
console.log(`\n${colors.bold}Testing phoneValidator middleware:${colors.reset}`);

test('Create phone validator middleware', () => {
  const validator = phoneValidator('phone', { country: 'IN', type: 'mobile' });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

test('Create phone validator with custom options', () => {
  const validator = phoneValidator('mobile', { 
    country: 'US', 
    type: 'mobile', 
    required: false,
    customMessage: 'Custom error message'
  });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

// Test formatting functionality
console.log(`\n${colors.bold}Testing formatPhone function:${colors.reset}`);

test('Format Indian mobile - international format', () => {
  const result = formatPhone('9876543210', 'IN', 'international');
  return assertEqual(result, '+919876543210', 'Should format as international');
});

test('Format Indian mobile - national format', () => {
  const result = formatPhone('9876543210', 'IN', 'national');
  return assertEqual(result, '9876543210', 'Should format as national');
});

test('Format Indian mobile - auto format', () => {
  const result = formatPhone('9876543210', 'IN', 'auto');
  return assertEqual(result, '+91 9876543210', 'Should format with auto spacing');
});

test('Format US mobile - international format', () => {
  const result = formatPhone('(555) 234-5678', 'US', 'international');
  return assertEqual(result, '+15552345678', 'Should format as international');
});

test('Format US mobile - national format', () => {
  const result = formatPhone('(555) 234-5678', 'US', 'national');
  return assertEqual(result, '5552345678', 'Should format as national');
});

test('Format US mobile - auto format', () => {
  const result = formatPhone('(555) 234-5678', 'US', 'auto');
  return assertEqual(result, '+1 (555) 234-5678', 'Should format with US auto formatting');
});

test('Format UK mobile - national format', () => {
  const result = formatPhone('+447123456789', 'UK', 'national');
  return assertEqual(result, '7123456789', 'Should format as national');
});

test('Format UK mobile - auto format', () => {
  const result = formatPhone('+447123456789', 'UK', 'auto');
  return assertEqual(result, '+44 7123 456 789', 'Should format with UK auto formatting');
});

test('Format with raw option', () => {
  const result = formatPhone('+91 9876 543 210', 'IN', 'raw');
  return assertEqual(result, '+919876543210', 'Should return raw format');
});

test('Format with custom formatter', () => {
  const customFormatter = (phone, country) => `[${country}] ${phone}`;
  const result = formatPhone('9876543210', 'IN', 'custom', customFormatter);
  return assertEqual(result, '[IN] +919876543210', 'Should use custom formatter');
});

test('Format invalid number returns original', () => {
  const result = formatPhone('1234567890', 'IN', 'auto');
  return assertEqual(result, '1234567890', 'Should return original for invalid number');
});

// Test phoneValidator with formatting options
console.log(`\n${colors.bold}Testing phoneValidator with formatting options:${colors.reset}`);

test('Create phone validator with international format', () => {
  const validator = phoneValidator('phone', { 
    country: 'IN', 
    type: 'mobile', 
    format: 'international' 
  });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

test('Create phone validator with national format', () => {
  const validator = phoneValidator('phone', { 
    country: 'US', 
    type: 'mobile', 
    format: 'national' 
  });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

test('Create phone validator with custom formatter', () => {
  const customFormatter = (phone, country) => `***${phone}***`;
  const validator = phoneValidator('phone', { 
    country: 'IN', 
    type: 'mobile', 
    format: 'custom',
    customFormatter: customFormatter
  });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

// Test custom error messages
console.log(`\n${colors.bold}Testing custom error messages:${colors.reset}`);

test('Create phone validator with custom error messages', () => {
  const validator = phoneValidator('phone', { 
    country: 'IN', 
    type: 'mobile',
    errorMessages: {
      required: 'Please provide your phone number',
      invalidFormat: 'Phone number format is incorrect',
      empty: 'Phone number cannot be empty',
      invalid: 'Invalid phone number provided'
    }
  });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

test('Create phone validator with partial custom error messages', () => {
  const validator = phoneValidator('phone', { 
    country: 'IN', 
    type: 'mobile',
    errorMessages: {
      required: 'Custom required message',
      invalidFormat: 'Custom format message'
    }
  });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

test('Create phone validator with custom message (legacy)', () => {
  const validator = phoneValidator('phone', { 
    country: 'IN', 
    type: 'mobile',
    customMessage: 'Legacy custom message'
  });
  return assertTrue(typeof validator === 'function', 'Should return a middleware function');
});

// Test format placeholders
console.log(`\n${colors.bold}Testing format placeholders:${colors.reset}`);

test('Get format placeholder for Indian mobile', () => {
  const placeholder = getFormatPlaceholder('IN', 'mobile');
  return assertEqual(placeholder, '9876543210', 'Should return Indian mobile placeholder');
});

test('Get format placeholder for US mobile', () => {
  const placeholder = getFormatPlaceholder('US', 'mobile');
  return assertEqual(placeholder, '(555) 234-5678', 'Should return US mobile placeholder');
});

test('Get format placeholder for UK mobile', () => {
  const placeholder = getFormatPlaceholder('UK', 'mobile');
  return assertEqual(placeholder, '07123456789', 'Should return UK mobile placeholder');
});

test('Get format placeholder for Indian landline', () => {
  const placeholder = getFormatPlaceholder('IN', 'landline');
  return assertEqual(placeholder, '02212345678', 'Should return Indian landline placeholder');
});

test('Get format placeholder for invalid country', () => {
  const placeholder = getFormatPlaceholder('XX', 'mobile');
  return assertTrue(placeholder === null, 'Should return null for invalid country');
});

test('Get format examples for Indian mobile', () => {
  const examples = getFormatExamples('IN', 'mobile');
  return assertTrue(Array.isArray(examples), 'Should return array of examples') &&
         assertTrue(examples.length > 0, 'Should have examples') &&
         assertTrue(examples.includes('9876543210'), 'Should include national format');
});

test('Get format examples for US mobile', () => {
  const examples = getFormatExamples('US', 'mobile');
  return assertTrue(Array.isArray(examples), 'Should return array of examples') &&
         assertTrue(examples.length > 0, 'Should have examples') &&
         assertTrue(examples.includes('(555) 234-5678'), 'Should include formatted example');
});

test('Get country format info for India', () => {
  const info = getCountryFormatInfo('IN');
  return assertTrue(info !== null, 'Should return format info') &&
         assertTrue(info.mobile !== undefined, 'Should have mobile placeholder') &&
         assertTrue(info.landline !== undefined, 'Should have landline placeholder') &&
         assertTrue(info.examples !== undefined, 'Should have examples');
});

test('Get country format info for invalid country', () => {
  const info = getCountryFormatInfo('XX');
  return assertTrue(info === null, 'Should return null for invalid country');
});

// Test results
console.log(`\n${colors.bold}${colors.yellow}Test Results:${colors.reset}`);
console.log(`${colors.green}Passed: ${passedTests}/${totalTests}${colors.reset}`);

if (passedTests === totalTests) {
  console.log(`${colors.green}${colors.bold}🎉 All tests passed!${colors.reset}`);
} else {
  console.log(`${colors.red}${colors.bold}❌ Some tests failed${colors.reset}`);
  process.exit(1);
}
