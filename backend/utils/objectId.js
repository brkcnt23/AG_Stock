// backend/utils/objectId.js
const mongoose = require('mongoose');

/**
 * Validate if a string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch (error) {
    return false;
  }
};

/**
 * Create a new ObjectId
 */
const createObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Convert string to ObjectId
 */
const toObjectId = (id) => {
  if (!id) return null;
  
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }
  
  if (typeof id === 'string' && isValidObjectId(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  
  throw new Error(`Geçersiz ObjectId formatı: ${id}`);
};

/**
 * Convert ObjectId to string
 */
const toString = (objectId) => {
  if (!objectId) return null;
  
  if (typeof objectId === 'string') {
    return objectId;
  }
  
  if (objectId instanceof mongoose.Types.ObjectId) {
    return objectId.toString();
  }
  
  if (objectId._id) {
    return toString(objectId._id);
  }
  
  return String(objectId);
};

/**
 * Safely convert multiple IDs
 */
const toObjectIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  
  return ids
    .filter(id => id && isValidObjectId(id))
    .map(id => toObjectId(id));
};

/**
 * Convert multiple ObjectIds to strings
 */
const toStrings = (objectIds) => {
  if (!Array.isArray(objectIds)) return [];
  
  return objectIds
    .filter(id => id)
    .map(id => toString(id));
};

/**
 * Compare two ObjectIds
 */
const equals = (id1, id2) => {
  if (!id1 || !id2) return false;
  
  const str1 = toString(id1);
  const str2 = toString(id2);
  
  return str1 === str2;
};

/**
 * Extract timestamp from ObjectId
 */
const getTimestamp = (objectId) => {
  if (!objectId) return null;
  
  try {
    const oid = toObjectId(objectId);
    return oid.getTimestamp();
  } catch (error) {
    return null;
  }
};

/**
 * Check if ObjectId is within date range
 */
const isInDateRange = (objectId, startDate, endDate) => {
  const timestamp = getTimestamp(objectId);
  if (!timestamp) return false;
  
  const time = timestamp.getTime();
  
  if (startDate && time < new Date(startDate).getTime()) {
    return false;
  }
  
  if (endDate && time > new Date(endDate).getTime()) {
    return false;
  }
  
  return true;
};

/**
 * Generate ObjectId for specific date
 */
const fromDate = (date) => {
  if (!date) return createObjectId();
  
  try {
    return mongoose.Types.ObjectId.createFromTime(Math.floor(new Date(date).getTime() / 1000));
  } catch (error) {
    return createObjectId();
  }
};

/**
 * Middleware to validate ObjectId parameters
 */
const validateObjectIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} parametresi gerekli`
      });
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Geçersiz ${paramName} formatı`
      });
    }
    
    // Convert to ObjectId and attach to request
    req.params[paramName] = toObjectId(id);
    next();
  };
};

/**
 * Middleware to validate multiple ObjectId parameters
 */
const validateObjectIdParams = (...paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      
      if (id && !isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: `Geçersiz ${paramName} formatı`
        });
      }
      
      if (id) {
        req.params[paramName] = toObjectId(id);
      }
    }
    
    next();
  };
};

/**
 * Clean document for frontend (convert ObjectIds to strings)
 */
const cleanDocument = (doc) => {
  if (!doc) return null;
  
  // Convert Mongoose document to plain object
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Convert _id to string
  if (obj._id) {
    obj._id = toString(obj._id);
  }
  
  // Convert other ObjectId fields to strings
  Object.keys(obj).forEach(key => {
    if (obj[key] instanceof mongoose.Types.ObjectId) {
      obj[key] = toString(obj[key]);
    }
  });
  
  return obj;
};

/**
 * Clean multiple documents
 */
const cleanDocuments = (docs) => {
  if (!Array.isArray(docs)) return [];
  return docs.map(cleanDocument);
};

/**
 * Aggregate pipeline helper for ObjectId matching
 */
const matchObjectId = (field, id) => {
  return {
    $match: {
      [field]: toObjectId(id)
    }
  };
};

/**
 * Lookup helper for ObjectId references
 */
const lookupObjectId = (from, localField, foreignField = '_id', as) => {
  return {
    $lookup: {
      from,
      localField,
      foreignField,
      as
    }
  };
};

module.exports = {
  // Core functions
  isValidObjectId,
  createObjectId,
  toObjectId,
  toString,
  toObjectIds,
  toStrings,
  equals,
  
  // Date functions
  getTimestamp,
  isInDateRange,
  fromDate,
  
  // Middleware
  validateObjectIdParam,
  validateObjectIdParams,
  
  // Document cleaning
  cleanDocument,
  cleanDocuments,
  
  // Aggregation helpers
  matchObjectId,
  lookupObjectId
};