const Joi = require('joi');
const { ApiError } = require('./error.middleware');

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new ApiError(400, 'Validation Error', errors));
    }

    req.body = value;
    next();
  };
};

/**
 * Validate request params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new ApiError(400, 'Validation Error', errors));
    }

    req.params = value;
    next();
  };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new ApiError(400, 'Validation Error', errors));
    }

    req.query = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  // About schema
  about: Joi.object({
    title: Joi.string().max(255),
    subtitle: Joi.string().max(255).allow(''),
    description: Joi.string().allow(''),
    bio: Joi.string().allow(''),
    resume_url: Joi.string().uri().allow(''),
    avatar_url: Joi.string().uri().allow(''),
    location: Joi.string().max(255).allow(''),
    email: Joi.string().email().allow(''),
    phone: Joi.string().max(50).allow(''),
    social_links: Joi.object({
      github: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow(''),
      twitter: Joi.string().uri().allow(''),
      instagram: Joi.string().uri().allow(''),
      youtube: Joi.string().uri().allow(''),
      website: Joi.string().uri().allow('')
    }),
    is_active: Joi.boolean()
  }),

  // Skill schema
  skill: Joi.object({
    name: Joi.string().max(255).required(),
    category: Joi.string().max(255).allow(''),
    proficiency: Joi.number().min(0).max(100),
    icon_url: Joi.string().uri().allow(''),
    description: Joi.string().allow(''),
    display_order: Joi.number().integer(),
    is_active: Joi.boolean()
  }),

  // Project schema
  project: Joi.object({
    title: Joi.string().max(255).required(),
    slug: Joi.string().max(255).required(),
    description: Joi.string().allow(''),
    long_description: Joi.string().allow(''),
    thumbnail_url: Joi.string().uri().allow(''),
    images: Joi.array().items(Joi.string().uri()),
    technologies: Joi.array().items(Joi.string()),
    live_url: Joi.string().uri().allow(''),
    github_url: Joi.string().uri().allow(''),
    category: Joi.string().max(255).allow(''),
    status: Joi.string().valid('completed', 'in-progress', 'planned'),
    featured: Joi.boolean(),
    display_order: Joi.number().integer(),
    is_active: Joi.boolean()
  }),

  // Blog schema
  blog: Joi.object({
    title: Joi.string().max(255).required(),
    slug: Joi.string().max(255).required(),
    excerpt: Joi.string().allow(''),
    content: Joi.string().allow(''),
    cover_image_url: Joi.string().uri().allow(''),
    category: Joi.string().max(255).allow(''),
    tags: Joi.array().items(Joi.string()),
    read_time: Joi.number().integer().min(1),
    is_published: Joi.boolean(),
    is_featured: Joi.boolean(),
    meta_title: Joi.string().max(255).allow(''),
    meta_description: Joi.string().allow(''),
    published_at: Joi.date().iso().allow(null)
  }),

  // Experience schema
  experience: Joi.object({
    company: Joi.string().max(255).required(),
    position: Joi.string().max(255).required(),
    location: Joi.string().max(255).allow(''),
    description: Joi.string().allow(''),
    responsibilities: Joi.array().items(Joi.string()),
    technologies: Joi.array().items(Joi.string()),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().allow(null),
    is_current: Joi.boolean(),
    company_logo_url: Joi.string().uri().allow(''),
    company_url: Joi.string().uri().allow(''),
    display_order: Joi.number().integer(),
    is_active: Joi.boolean()
  }),

  // Testimonial schema
  testimonial: Joi.object({
    name: Joi.string().max(255).required(),
    position: Joi.string().max(255).allow(''),
    company: Joi.string().max(255).allow(''),
    content: Joi.string().required(),
    avatar_url: Joi.string().uri().allow(''),
    rating: Joi.number().integer().min(1).max(5),
    display_order: Joi.number().integer(),
    is_active: Joi.boolean()
  }),

  // Service schema
  service: Joi.object({
    title: Joi.string().max(255).required(),
    description: Joi.string().allow(''),
    icon: Joi.string().max(255).allow(''),
    icon_url: Joi.string().uri().allow(''),
    features: Joi.array().items(Joi.string()),
    display_order: Joi.number().integer(),
    is_active: Joi.boolean()
  }),

  // Contact form schema
  contact: Joi.object({
    name: Joi.string().max(255).required().messages({
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    subject: Joi.string().max(255).allow(''),
    message: Joi.string().required().messages({
      'any.required': 'Message is required'
    }),
    phone: Joi.string().max(50).allow('')
  }),

  // UUID param schema
  uuidParam: Joi.object({
    id: Joi.string().uuid().required()
  }),

  // Pagination query schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string(),
    order: Joi.string().valid('asc', 'desc')
  })
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
  schemas
};