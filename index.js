// Custom validation system - no external dependencies

/**
 * Phone number validation patterns for different countries
 */
const PHONE_PATTERNS = {
  // India
  IN: {
    mobile: /^[6-9]\d{9}$/,
    landline: /^[2-9]\d{7,8}$/,
    withCountryCode: /^\+91[6-9]\d{9}$/
  },
  // United States
  US: {
    mobile: /^\(?([2-9]\d{2})\)?[-. ]?([2-9]\d{2})[-. ]?(\d{4})$/,
    withCountryCode: /^\+1[2-9]\d{2}[2-9]\d{6}$/
  },
  // United Kingdom
  UK: {
    mobile: /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/,
    landline: /^(\+44\s?[1-9]\d{2}|\(?0[1-9]\d{2}\)?)\s?\d{3}\s?\d{4}$/
  },
  // Generic international format
  INTERNATIONAL: /^\+[1-9]\d{1,14}$/
};

/**
 * Format placeholders for different countries and phone types
 */
const FORMAT_PLACEHOLDERS = {
  IN: {
    mobile: '9876543210',
    landline: '02212345678',
    examples: {
      mobile: ['9876543210', '+919876543210'],
      landline: ['02212345678', '+912212345678']
    }
  },
  US: {
    mobile: '(555) 234-5678',
    landline: '(555) 123-4567',
    examples: {
      mobile: ['(555) 234-5678', '555-234-5678', '5552345678', '+15552345678'],
      landline: ['(555) 123-4567', '555-123-4567', '5551234567', '+15551234567']
    }
  },
  UK: {
    mobile: '07123456789',
    landline: '02012345678',
    examples: {
      mobile: ['07123456789', '+447123456789'],
      landline: ['02012345678', '+442012345678']
    }
  }
};

/**
 * Country-specific phone number validation
 * @param {string} phoneNumber - The phone number to validate
 * @param {string} country - Country code (IN, US, UK, etc.)
 * @param {string} type - Type of phone (mobile, landline, any)
 * @returns {Object} Validation result with isValid and formatted number
 */
export function validatePhoneNumber(phoneNumber, country = 'IN', type = 'mobile') {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required and must be a string',
      formatted: null,
      errorType: 'required'
    };
  }

  // Clean the phone number (remove spaces, dashes, but keep parentheses for US format validation)
  const cleaned = phoneNumber.replace(/[\s\-]/g, '');
  
  const patterns = PHONE_PATTERNS[country];
  if (!patterns) {
    return {
      isValid: false,
      error: `Unsupported country code: ${country}`,
      formatted: null,
      errorType: 'invalidFormat'
    };
  }

  let isValid = false;
  let formatted = cleaned;

  if (type === 'mobile') {
    // Check both mobile pattern and mobile with country code
    isValid = (patterns.mobile && patterns.mobile.test(cleaned)) || 
              (patterns.withCountryCode && patterns.withCountryCode.test(cleaned));
  } else if (type === 'landline') {
    isValid = patterns.landline ? patterns.landline.test(cleaned) : false;
  } else if (type === 'any') {
    // Check mobile, landline, and country code patterns
    isValid = (patterns.mobile && patterns.mobile.test(cleaned)) || 
              (patterns.landline && patterns.landline.test(cleaned)) ||
              (patterns.withCountryCode && patterns.withCountryCode.test(cleaned));
  }

  // Format the number based on country
  if (isValid) {
    formatted = formatPhoneNumber(cleaned, country);
  }

  return {
    isValid,
    error: isValid ? null : `Invalid ${type} phone number for ${country}`,
    formatted: isValid ? formatted : null,
    errorType: isValid ? null : 'invalidFormat'
  };
}

/**
 * Format phone number based on country
 * @param {string} phoneNumber - Cleaned phone number
 * @param {string} country - Country code
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phoneNumber, country) {
  switch (country) {
    case 'IN':
      if (phoneNumber.startsWith('+91')) {
        return phoneNumber;
      }
      return `+91${phoneNumber}`;
    
    case 'US':
      if (phoneNumber.startsWith('+1')) {
        return phoneNumber;
      }
      // Handle US numbers with parentheses
      if (phoneNumber.includes('(') && phoneNumber.includes(')')) {
        const digits = phoneNumber.replace(/[\s\-\(\)]/g, '');
        return `+1${digits}`;
      }
      if (phoneNumber.length === 10) {
        return `+1${phoneNumber}`;
      }
      return phoneNumber;
    
    case 'UK':
      if (phoneNumber.startsWith('+44')) {
        return phoneNumber;
      }
      if (phoneNumber.startsWith('0')) {
        return `+44${phoneNumber.substring(1)}`;
      }
      return `+44${phoneNumber}`;
    
    default:
      return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  }
}

/**
 * Format phone number with developer-specified options
 * @param {string} phoneNumber - Phone number to format
 * @param {string} country - Country code
 * @param {string} format - Format type ('auto', 'international', 'national', 'raw', 'custom')
 * @param {Function} customFormatter - Custom formatting function
 * @returns {string} Formatted phone number
 */
function formatPhoneNumberWithOptions(phoneNumber, country, format, customFormatter) {
  if (!phoneNumber) return phoneNumber;
  
  // Use custom formatter if provided
  if (format === 'custom' && customFormatter && typeof customFormatter === 'function') {
    return customFormatter(phoneNumber, country);
  }
  
  // Extract the national number (without country code)
  const nationalNumber = extractNationalNumber(phoneNumber, country);
  
  switch (format) {
    case 'international':
      return phoneNumber; // Already in international format
      
    case 'national':
      return nationalNumber;
      
    case 'raw':
      return phoneNumber.replace(/[\s\-\(\)]/g, '');
      
    case 'auto':
    default:
      return formatPhoneNumberAuto(phoneNumber, country);
  }
}

/**
 * Extract national number from international format
 * @param {string} phoneNumber - International phone number
 * @param {string} country - Country code
 * @returns {string} National phone number
 */
function extractNationalNumber(phoneNumber, country) {
  const countryCodes = {
    'IN': '+91',
    'US': '+1',
    'UK': '+44'
  };
  
  const countryCode = countryCodes[country];
  if (countryCode && phoneNumber.startsWith(countryCode)) {
    return phoneNumber.substring(countryCode.length);
  }
  
  // For US numbers, also handle cases where the number might be in (XXX) XXX-XXXX format
  if (country === 'US' && phoneNumber.includes('(') && phoneNumber.includes(')')) {
    return phoneNumber.replace(/[\s\-\(\)]/g, '');
  }
  
  return phoneNumber;
}

/**
 * Auto-format phone number based on country conventions
 * @param {string} phoneNumber - Phone number to format
 * @param {string} country - Country code
 * @returns {string} Auto-formatted phone number
 */
function formatPhoneNumberAuto(phoneNumber, country) {
  const nationalNumber = extractNationalNumber(phoneNumber, country);
  
  switch (country) {
    case 'IN':
      // Format as +91 XXXXXXXXXX
      return `+91 ${nationalNumber}`;
      
    case 'US':
      // Format as +1 (XXX) XXX-XXXX
      if (nationalNumber.length === 10) {
        return `+1 (${nationalNumber.substring(0, 3)}) ${nationalNumber.substring(3, 6)}-${nationalNumber.substring(6)}`;
      }
      return phoneNumber;
      
    case 'UK':
      // Format as +44 XXXX XXX XXX
      if (nationalNumber.length === 10) {
        return `+44 ${nationalNumber.substring(0, 4)} ${nationalNumber.substring(4, 7)} ${nationalNumber.substring(7)}`;
      }
      return phoneNumber;
      
    default:
      return phoneNumber;
  }
}

/**
 * Custom validation error class
 */
class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Custom validation result class
 */
class ValidationResult {
  constructor() {
    this.errors = [];
  }

  isEmpty() {
    return this.errors.length === 0;
  }

  array() {
    return this.errors.map(error => ({
      type: 'field',
      msg: error.message,
      value: error.value,
      path: error.field,
      location: 'body'
    }));
  }

  addError(field, message, value) {
    this.errors.push({ field, message, value });
  }
}

/**
 * Express.js middleware for phone number validation
 * @param {string} fieldName - Name of the field to validate
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware function
 */
export function phoneValidator(fieldName = 'phone', options = {}) {
  const {
    country = 'IN',
    type = 'mobile',
    required = true,
    customMessage = null,
    format = 'auto', // 'auto', 'international', 'national', 'raw', 'custom'
    customFormatter = null,
    errorMessages = {}
  } = options;
  
  // Get format placeholder for better error messages
  const placeholder = getFormatPlaceholder(country, type);
  const examples = getFormatExamples(country, type);
  
  // Default error messages with format examples
  const defaultErrors = {
    required: `${fieldName} is required`,
    invalidFormat: `Invalid ${type} phone number for ${country}${placeholder ? `. Expected format: ${placeholder}` : ''}`,
    invalidLength: `Phone number must be valid length for ${country}${placeholder ? `. Expected format: ${placeholder}` : ''}`,
    empty: `${fieldName} cannot be empty`,
    invalid: `Please provide a valid ${fieldName}${placeholder ? `. Expected format: ${placeholder}` : ''}`
  };
  
  // Add examples to error messages if available
  if (examples && examples.length > 0) {
    const exampleText = examples.length > 1 ? `Examples: ${examples.join(', ')}` : `Example: ${examples[0]}`;
    defaultErrors.invalidFormat += ` ${exampleText}`;
    defaultErrors.invalidLength += ` ${exampleText}`;
    defaultErrors.invalid += ` ${exampleText}`;
  }
  
  // Merge with custom error messages
  const errors = { ...defaultErrors, ...errorMessages };

  return (req, res, next) => {
    try {
      const value = req.body[fieldName];
      
      // Check if field is empty
      if (!value || value.trim() === '') {
        if (!required) {
          return next(); // Skip validation if field is optional and empty
        }
        throw new ValidationError(customMessage || errors.required, fieldName, value);
      }

      // Check if field is just whitespace
      if (value.trim() === '') {
        throw new ValidationError(customMessage || errors.empty, fieldName, value);
      }

      // Validate the phone number
      const result = validatePhoneNumber(value, country, type);
      if (!result.isValid) {
        // Use specific error message based on the error type
        let errorMessage = customMessage || errors.invalid;
        
        if (result.errorType === 'required') {
          errorMessage = errors.required;
        } else if (result.errorType === 'invalidLength') {
          errorMessage = errors.invalidLength;
        } else if (result.errorType === 'invalidFormat') {
          errorMessage = errors.invalidFormat;
        }
        
        throw new ValidationError(errorMessage, fieldName, value);
      }

      // Apply formatting if validation passed
      if (result.isValid && result.formatted) {
        req.body[fieldName] = formatPhoneNumberWithOptions(result.formatted, country, format, customFormatter);
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        const validationResult = new ValidationResult();
        validationResult.addError(error.field, error.message, error.value);
        req.validationErrors = validationResult;
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationResult.array()
        });
      }
      next(error);
    }
  };
}

/**
 * Validation result middleware (for backward compatibility)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validateRequest(req, res, next) {
  // This function is now mainly for backward compatibility
  // The phoneValidator middleware handles validation directly
  if (req.validationErrors && !req.validationErrors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: req.validationErrors.array()
    });
  }
  next();
}

/**
 * Get supported countries
 * @returns {Array} Array of supported country codes
 */
export function getSupportedCountries() {
  return Object.keys(PHONE_PATTERNS);
}

/**
 * Get phone patterns for a specific country
 * @param {string} country - Country code
 * @returns {Object|null} Phone patterns or null if not supported
 */
export function getPhonePatterns(country) {
  return PHONE_PATTERNS[country] || null;
}

/**
 * Get format placeholder for a specific country and phone type
 * @param {string} country - Country code
 * @param {string} type - Phone type (mobile, landline)
 * @returns {string|null} Format placeholder or null if not supported
 */
export function getFormatPlaceholder(country, type = 'mobile') {
  const countryData = FORMAT_PLACEHOLDERS[country];
  if (!countryData) return null;
  return countryData[type] || null;
}

/**
 * Get format examples for a specific country and phone type
 * @param {string} country - Country code
 * @param {string} type - Phone type (mobile, landline)
 * @returns {Array|null} Format examples or null if not supported
 */
export function getFormatExamples(country, type = 'mobile') {
  const countryData = FORMAT_PLACEHOLDERS[country];
  if (!countryData || !countryData.examples) return null;
  return countryData.examples[type] || null;
}

/**
 * Get all format placeholders for a country
 * @param {string} country - Country code
 * @returns {Object|null} All format placeholders or null if not supported
 */
export function getCountryFormatInfo(country) {
  return FORMAT_PLACEHOLDERS[country] || null;
}

/**
 * Format a phone number with specified options
 * @param {string} phoneNumber - Phone number to format
 * @param {string} country - Country code
 * @param {string} format - Format type ('auto', 'international', 'national', 'raw', 'custom')
 * @param {Function} customFormatter - Custom formatting function
 * @returns {string} Formatted phone number
 */
export function formatPhone(phoneNumber, country = 'IN', format = 'auto', customFormatter = null) {
  if (!phoneNumber) return phoneNumber;
  
  // First validate the number
  const validation = validatePhoneNumber(phoneNumber, country, 'any');
  if (!validation.isValid) {
    return phoneNumber; // Return original if invalid
  }
  
  // Use the validated and formatted number
  const validatedNumber = validation.formatted || phoneNumber;
  
  // Apply the requested formatting
  return formatPhoneNumberWithOptions(validatedNumber, country, format, customFormatter);
}

// Default export
export default {
  validatePhoneNumber,
  phoneValidator,
  validateRequest,
  formatPhone,
  getSupportedCountries,
  getPhonePatterns,
  getFormatPlaceholder,
  getFormatExamples,
  getCountryFormatInfo,
  PHONE_PATTERNS,
  FORMAT_PLACEHOLDERS
};
