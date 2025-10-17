# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-19

### 🔒 Security
- **BREAKING**: Removed `express-validator` dependency to eliminate security vulnerabilities
- **FIXED**: Resolved 3 moderate severity vulnerabilities from `validator` package
- **IMPROVED**: Package now has zero external dependencies

### ✨ Added
- Custom validation system with `ValidationError` and `ValidationResult` classes
- Built-in error handling and response formatting
- Enhanced security with no external dependencies

### 🔄 Changed
- `phoneValidator` now returns a single middleware function instead of an array
- Updated all internal validation logic to use custom implementation
- Improved error messages with better formatting and examples

### 🧪 Testing
- Updated all 41 tests to work with new validation system
- All tests passing with zero vulnerabilities
- Maintained 100% API compatibility

### 📦 Dependencies
- **REMOVED**: `express-validator` (security vulnerability source)
- **REMOVED**: `validator` (transitive dependency)
- **RESULT**: Zero external dependencies, fully self-contained package

## [1.0.1] - 2024-12-19

### 📄 Added
- MIT License file for proper open source licensing
- Updated package.json with correct author information

## [1.0.0] - 2024-12-19

### ✨ Initial Release
- Phone number validation for India, US, and UK
- Express.js middleware support
- Custom formatting options (international, national, auto, raw, custom)
- Custom error messages and validation rules
- Format placeholders and examples
- Comprehensive test suite (41 tests)
- Full documentation and examples
