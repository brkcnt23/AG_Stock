// backend/utils/validation.js
const Joi = require('joi');
const { isValidObjectId } = require('./objectId');

/**
 * Custom Joi validators
 */
const customJoi = Joi.extend({
  type: 'objectId',
  base: Joi.string(),
  messages: {
    'objectId.invalid': 'Geçersiz ObjectId formatı'
  },
  validate(value, helpers) {
    if (!isValidObjectId(value)) {
      return { value, errors: helpers.error('objectId.invalid') };
    }
    return { value };
  }
});

/**
 * Common validation schemas
 */
const commonSchemas = {
  objectId: customJoi.objectId().required(),
  optionalObjectId: customJoi.objectId().optional(),
  
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  // Search
  search: Joi.string().min(1).max(100).optional(),
  
  // Dates
  date: Joi.date().iso().optional(),
  dateRange: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  }).optional(),
  
  // Price
  price: Joi.number().positive().precision(2).optional(),
  priceRange: Joi.object({
    min: Joi.number().positive().precision(2).optional(),
    max: Joi.number().positive().precision(2).optional()
  }).optional(),
  
  // Turkish text
  turkishText: Joi.string().pattern(/^[a-zA-ZçÇğĞıİöÖşŞüÜ0-9\s\-\.\_\(\)]+$/),
  
  // Status
  status: Joi.string().valid('Aktif', 'Pasif', 'Beklemede', 'Arızalı').default('Aktif'),
  
  // Currency
  currency: Joi.string().valid('TL', 'USD', 'EUR').default('TL')
};

/**
 * Material validation schemas
 */
const sarfSchema = Joi.object({
  malzeme: Joi.string().required().max(100),
  cins: Joi.string().required().max(50),
  tip: Joi.string().required().max(50),
  aciklama: Joi.string().max(500).optional(),
  olcu: Joi.string().max(50).optional(),
  boyut: Joi.string().max(50).optional(),
  cap: Joi.number().positive().optional(),
  uzunluk: Joi.number().positive().optional(),
  agirlik: Joi.number().positive().optional(),
  renk: Joi.string().max(30).optional(),
  adet: Joi.number().positive().required(),
  birim: Joi.string().required().max(20),
  stokKodu: Joi.string().max(50).optional(),
  depoYeri: Joi.string().max(100).optional(),
  rafNo: Joi.string().max(50).optional(),
  bolum: Joi.string().max(50).optional(),
  proje: Joi.string().required().max(100),
  durumu: commonSchemas.status,
  satinAlisFiyati: commonSchemas.price,
  paraBirimi: commonSchemas.currency,
  tedarikci: Joi.string().max(100).optional(),
  notlar: Joi.string().max(1000).optional(),
  resimUrl: Joi.string().uri().optional(),
  barkod: Joi.string().max(50).optional()
});

const celikSchema = Joi.object({
  malzemeCinsi: Joi.string().required().max(100),
  kalite: Joi.string().required().max(50),
  tip: Joi.string().required().max(50),
  aciklama: Joi.string().max(500).optional(),
  en: Joi.number().positive().optional(),
  boy: Joi.number().positive().optional(),
  kalinlik: Joi.number().positive().optional(),
  uzunluk: Joi.number().positive().optional(),
  cap: Joi.number().positive().optional(),
  agirlik: Joi.number().positive().optional(),
  adet: Joi.number().positive().required(),
  birim: Joi.string().required().max(20),
  stokKodu: Joi.string().max(50).optional(),
  depoYeri: Joi.string().max(100).optional(),
  rafNo: Joi.string().max(50).optional(),
  bolum: Joi.string().max(50).optional(),
  proje: Joi.string().required().max(100),
  durumu: commonSchemas.status,
  satinAlisFiyati: commonSchemas.price,
  paraBirimi: commonSchemas.currency,
  tedarikci: Joi.string().max(100).optional(),
  carbonOrani: Joi.number().min(0).max(100).optional(),
  sertlik: Joi.string().max(50).optional(),
  cetele: Joi.string().max(100).optional(),
  normStandardi: Joi.string().max(100).optional(),
  notlar: Joi.string().max(1000).optional(),
  resimUrl: Joi.string().uri().optional(),
  sertifika: Joi.string().max(200).optional()
});

const membranSchema = Joi.object({
  malzemeTuru: Joi.string().required().max(50),
  malzemeCinsi: Joi.string().required().max(100),
  kalite: Joi.string().max(50).optional(),
  aciklama: Joi.string().max(500).optional(),
  en: Joi.number().positive().optional(),
  boy: Joi.number().positive().optional(),
  kalinlik: Joi.number().positive().optional(),
  cap: Joi.number().positive().optional(),
  alan: Joi.number().positive().optional(),
  basincDirenci: Joi.number().positive().optional(),
  sicaklikDirenci: Joi.number().optional(),
  kimyasalDirenç: Joi.string().max(100).optional(),
  esneklik: Joi.string().max(50).optional(),
  renk: Joi.string().max(30).optional(),
  yuzeyTipi: Joi.string().max(50).optional(),
  adet: Joi.number().positive().required(),
  birim: Joi.string().required().max(20),
  stokKodu: Joi.string().max(50).optional(),
  depoYeri: Joi.string().max(100).optional(),
  rafNo: Joi.string().max(50).optional(),
  bolum: Joi.string().max(50).optional(),
  proje: Joi.string().required().max(100),
  durumu: commonSchemas.status,
  satinAlisFiyati: commonSchemas.price,
  paraBirimi: commonSchemas.currency,
  tedarikci: Joi.string().max(100).optional(),
  notlar: Joi.string().max(1000).optional(),
  resimUrl: Joi.string().uri().optional(),
  sertifika: Joi.string().max(200).optional()
});

const fitilSchema = Joi.object({
  malzeme: Joi.string().required().max(100),
  cins: Joi.string().required().max(50),
  kalite: Joi.string().max(50).optional(),
  aciklama: Joi.string().max(500).optional(),
  cap: Joi.number().positive().optional(),
  uzunluk: Joi.number().positive().optional(),
  renk: Joi.string().max(30).optional(),
  malzemeTuru: Joi.string().max(50).optional(),
  elastikiyet: Joi.string().max(50).optional(),
  sicaklikDirenci: Joi.number().optional(),
  adet: Joi.number().positive().required(),
  birim: Joi.string().required().max(20),
  stokKodu: Joi.string().max(50).optional(),
  depoYeri: Joi.string().max(100).optional(),
  rafNo: Joi.string().max(50).optional(),
  bolum: Joi.string().max(50).optional(),
  proje: Joi.string().required().max(100),
  durumu: commonSchemas.status,
  satinAlisFiyati: commonSchemas.price,
  paraBirimi: commonSchemas.currency,
  tedarikci: Joi.string().max(100).optional(),
  notlar: Joi.string().max(1000).optional(),
  resimUrl: Joi.string().uri().optional(),
  sertifika: Joi.string().max(200).optional()
});

/**
 * Validation middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors
      });
    }

    req[property] = value;
    next();
  };
};

/**
 * Query validation middleware
 */
const validateQuery = (schema) => {
  return validate(schema, 'query');
};

/**
 * Params validation middleware
 */
const validateParams = (schema) => {
  return validate(schema, 'params');
};

/**
 * Sanitization helpers
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

const sanitizeNumber = (num, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return 0;
  return Math.max(min, Math.min(max, parsed));
};

const sanitizeInput = (obj) => {
  if (!obj || typeof obj !== 'object') return {};
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Custom validation functions
 */
const isValidTurkishText = (text) => {
  const turkishPattern = /^[a-zA-ZçÇğĞıİöÖşŞüÜ0-9\s\-\.\_\(\)]+$/;
  return turkishPattern.test(text);
};

const isValidPhoneNumber = (phone) => {
  const phonePattern = /^(\+90|0)?[0-9]{10}$/;
  return phonePattern.test(phone.replace(/\s/g, ''));
};

const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

module.exports = {
  // Joi extensions
  customJoi,
  
  // Common schemas
  commonSchemas,
  
  // Material schemas
  sarfSchema,
  celikSchema,
  membranSchema,
  fitilSchema,
  
  // Middleware
  validate,
  validateQuery,
  validateParams,
  
  // Sanitization
  sanitizeString,
  sanitizeNumber,
  sanitizeInput,
  
  // Custom validators
  isValidTurkishText,
  isValidPhoneNumber,
  isValidEmail
};