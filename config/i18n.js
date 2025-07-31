const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

const i18nConfig = {
  // Language detection order
  detection: {
    order: ['header', 'querystring', 'cookie', 'session'],
    lookupQuerystring: 'lang',
    lookupCookie: 'i18next',
    lookupSession: 'lang',
    lookupHeader: 'accept-language',
    caches: ['cookie'],
    cookieMinutes: 60 * 24 * 7, // 7 days
    cookieOptions: {
      path: '/',
      sameSite: 'strict'
    }
  },

  // Backend configuration
  backend: {
    loadPath: path.join(__dirname, '../locales/{{lng}}.json'),
    addPath: path.join(__dirname, '../locales/{{lng}}.json'),
    jsonIndent: 2
  },

  // Fallback language
  fallbackLng: 'en',

  // Supported languages
  supportedLngs: ['en', 'es'],

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV === 'development',

  // Interpolation options
  interpolation: {
    escapeValue: false, // React already does escaping
    formatSeparator: ',',
    format: function(value, format, lng) {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
      return value;
    }
  },

  // Default namespace
  defaultNS: 'common',
  ns: ['common', 'auth', 'course_allocations', 'activity_logs', 'errors', 'validation'],

  // Return objects for plural
  returnObjects: true,

  // Key separator
  keySeparator: '.',

  // Namespace separator
  nsSeparator: ':',

  // Pluralization
  pluralSeparator: '_',

  // Context separator
  contextSeparator: '_',

  // Save missing keys
  saveMissing: process.env.NODE_ENV === 'development',
  missingKeyHandler: function(lng, ns, key, fallbackValue) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: ${lng}.${ns}.${key}`);
    }
  },

  // Resources (if not using backend)
  resources: {},

  // React options (if using with React)
  react: {
    useSuspense: false
  }
};

// Initialize i18next
const initI18n = async () => {
  try {
    await i18next
      .use(Backend)
      .use(middleware.LanguageDetector)
      .init(i18nConfig);
    
    console.log('i18next initialized successfully');
    return i18next;
  } catch (error) {
    console.error('Failed to initialize i18next:', error);
    throw error;
  }
};

// Helper functions for translations
const t = (key, options = {}) => {
  return i18next.t(key, options);
};

const exists = (key) => {
  return i18next.exists(key);
};

const changeLanguage = async (lng) => {
  try {
    await i18next.changeLanguage(lng);
    return lng;
  } catch (error) {
    console.error('Failed to change language:', error);
    throw error;
  }
};

const getLanguage = () => {
  return i18next.language;
};

const getSupportedLanguages = () => {
  return i18nConfig.supportedLngs;
};

// Middleware for Express
const i18nMiddleware = middleware.handle(i18next);

// Custom middleware for adding translation helpers to request
const addTranslationHelpers = (req, res, next) => {
  // Add translation function to request
  req.t = (key, options = {}) => {
    return req.i18n.t(key, options);
  };

  // Add language detection to response locals
  res.locals.language = req.language;
  res.locals.t = req.t;

  next();
};

// Error message formatter
const formatErrorMessage = (error, req) => {
  const baseKey = 'errors.';
  
  if (error.name === 'SequelizeValidationError') {
    return req.t(`${baseKey}validation_error`, { 
      field: error.errors[0]?.path || 'unknown' 
    });
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return req.t(`${baseKey}foreign_key_constraint`);
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return req.t(`${baseKey}unique_constraint`, {
      field: error.errors[0]?.path || 'unknown'
    });
  }
  
  return req.t(`${baseKey}internal_server_error`);
};

// Validation message formatter
const formatValidationMessage = (field, rule, value) => {
  return i18next.t(`validation.${rule}`, { field, value });
};

module.exports = {
  i18nConfig,
  initI18n,
  i18nMiddleware,
  addTranslationHelpers,
  formatErrorMessage,
  formatValidationMessage,
  t,
  exists,
  changeLanguage,
  getLanguage,
  getSupportedLanguages
};
