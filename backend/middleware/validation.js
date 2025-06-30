// backend/middleware/validation.js
const { validate, validateQuery, validateParams } = require('../utils/validation');
const { validateObjectIdParam } = require('../utils/objectId');

/**
 * Request validation middleware factory
 */
const createValidationMiddleware = (schema, options = {}) => {
  const {
    property = 'body',
    abortEarly = false,
    stripUnknown = true,
    convert = true,
    allowUndefined = false
  } = options;

  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly,
      stripUnknown,
      convert,
      allowUndefined,
      context: { req }
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        message: 'Veri doğrulama hatası',
        errors,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      });
    }

    // Replace original data with validated and transformed data
    req[property] = value;
    next();
  };
};

/**
 * File upload validation
 */
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    required = false
  } = options;

  return (req, res, next) => {
    const file = req.file;

    // Check if file is required
    if (required && !file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yükleme zorunlu'
      });
    }

    // If no file and not required, continue
    if (!file) {
      return next();
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `Dosya boyutu ${Math.round(maxSize / 1024 / 1024)}MB\'dan büyük olamaz`
      });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `İzin verilen dosya türleri: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Bulk operation validation
 */
const validateBulkOperation = (itemSchema, options = {}) => {
  const {
    maxItems = 100,
    minItems = 1
  } = options;

  return (req, res, next) => {
    const items = req.body.items || req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Toplu işlem için dizi formatında veri gönderilmeli'
      });
    }

    if (items.length < minItems) {
      return res.status(400).json({
        success: false,
        message: `En az ${minItems} öğe gönderilmeli`
      });
    }

    if (items.length > maxItems) {
      return res.status(400).json({
        success: false,
        message: `En fazla ${maxItems} öğe gönderilebilir`
      });
    }

    // Validate each item
    const errors = [];
    const validatedItems = [];

    items.forEach((item, index) => {
      const { error, value } = itemSchema.validate(item, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push({
          index,
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      } else {
        validatedItems.push(value);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bazı öğelerde doğrulama hatası',
        errors
      });
    }

    req.body.items = validatedItems;
    next();
  };
};

/**
 * Conditional validation based on request properties
 */
const conditionalValidation = (conditions) => {
  return (req, res, next) => {
    for (const condition of conditions) {
      const { when, then, otherwise } = condition;
      
      let shouldValidate = false;
      
      if (typeof when === 'function') {
        shouldValidate = when(req);
      } else if (typeof when === 'object') {
        shouldValidate = Object.keys(when).every(key => {
                  return req.body[key] === when[key] || req.query[key] === when[key] || req.params[key] === when[key];
                });
              }
        
              if (shouldValidate && typeof then === 'function') {
                return then(req, res, next);
              } else if (!shouldValidate && typeof otherwise === 'function') {
                return otherwise(req, res, next);
              }
            }
            next();
          };
        };
        
        // Export all middleware
        module.exports = {
          createValidationMiddleware,
          validateFileUpload,
          validateBulkOperation,
          conditionalValidation,
          validate,
          validateQuery,
          validateParams,
          validateObjectIdParam
        };