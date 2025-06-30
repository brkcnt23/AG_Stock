// backend/utils/helpers.js
const mongoose = require('mongoose');

/**
 * Response formatters
 */
const successResponse = (data, message = 'İşlem başarılı', pagination = null, filters = null) => {
  const response = {
    success: true,
    data,
    message
  };

  if (pagination) {
    response.pagination = pagination;
  }

  if (filters) {
    response.filters = filters;
  }

  return response;
};

const errorResponse = (message = 'Bir hata oluştu', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Pagination helper
 */
const getPaginationInfo = (page, limit, totalCount) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  return {
    page: currentPage,
    limit: itemsPerPage,
    totalCount,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * Query builders
 */
const buildSearchQuery = (search, fields = []) => {
  if (!search || !fields.length) return {};
  
  const searchRegex = new RegExp(search, 'i');
  return {
    $or: fields.map(field => ({ [field]: searchRegex }))
  };
};

const buildDateRangeQuery = (startDate, endDate, field = 'createdAt') => {
  const query = {};
  
  if (startDate) {
    query[field] = { $gte: new Date(startDate) };
  }
  
  if (endDate) {
    query[field] = { 
      ...query[field],
      $lte: new Date(endDate) 
    };
  }
  
  return query;
};

const buildPriceRangeQuery = (minPrice, maxPrice, field = 'satinAlisFiyati') => {
  const query = {};
  
  if (minPrice !== undefined && minPrice !== null) {
    query[field] = { $gte: parseFloat(minPrice) };
  }
  
  if (maxPrice !== undefined && maxPrice !== null) {
    query[field] = { 
      ...query[field],
      $lte: parseFloat(maxPrice) 
    };
  }
  
  return query;
};

/**
 * Stock status helpers
 */
const getStockStatus = (item, lowStockThreshold = 10, criticalStockThreshold = 5) => {
  const remaining = item.kalanMiktar || item.adet || 0;
  
  if (remaining <= 0) return 'outOfStock';
  if (remaining <= criticalStockThreshold) return 'criticalStock';
  if (remaining <= lowStockThreshold) return 'lowStock';
  return 'inStock';
};

const addStockStatusToItems = (items, lowStockThreshold = 10, criticalStockThreshold = 5) => {
  return items.map(item => ({
    ...item,
    stockStatus: getStockStatus(item, lowStockThreshold, criticalStockThreshold)
  }));
};

/**
 * Data transformation helpers
 */
const sanitizeItem = (item) => {
  const sanitized = { ...item };
  
  // Remove sensitive fields
  delete sanitized.__v;
  
  // Convert ObjectId to string for frontend
  if (sanitized._id && typeof sanitized._id === 'object') {
    sanitized._id = sanitized._id.toString();
  }
  
  return sanitized;
};

const sanitizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(sanitizeItem);
};

/**
 * Validation helpers
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const parseNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseInteger = (value, defaultValue = 0) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Array helpers
 */
const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Date helpers
 */
const formatDate = (date, locale = 'tr-TR') => {
  if (!date) return null;
  
  try {
    return new Date(date).toLocaleDateString(locale);
  } catch (error) {
    return null;
  }
};

const isDateExpired = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Calculation helpers
 */
const calculateTotalValue = (items, priceField = 'satinAlisFiyati', quantityField = 'adet') => {
  return items.reduce((total, item) => {
    const price = parseNumber(item[priceField]);
    const quantity = parseNumber(item[quantityField]);
    return total + (price * quantity);
  }, 0);
};

const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * String helpers
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Export all helpers
 */
module.exports = {
  // Response helpers
  successResponse,
  errorResponse,
  
  // Pagination
  getPaginationInfo,
  
  // Query builders
  buildSearchQuery,
  buildDateRangeQuery,
  buildPriceRangeQuery,
  
  // Stock helpers
  getStockStatus,
  addStockStatusToItems,
  
  // Data transformation
  sanitizeItem,
  sanitizeItems,
  
  // Validation
  isValidObjectId,
  parseNumber,
  parseInteger,
  
  // Array helpers
  removeDuplicates,
  groupBy,
  
  // Date helpers
  formatDate,
  isDateExpired,
  
  // Calculations
  calculateTotalValue,
  calculatePercentage,
  
  // String helpers
  slugify,
  capitalize
};