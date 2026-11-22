/**
 * validate.js
 *
 * Joi-based request validation middleware factory.
 *
 * Usage:
 *   const { validate } = require('../middleware/validate');
 *   const schema = Joi.object({ email: Joi.string().email().required() });
 *
 *   router.post('/register', validate(schema), authController.register);
 *
 * You can validate req.body (default), req.query, req.params or any combination.
 */

const Joi = require('joi');

/**
 * validate(schema, [target='body'])
 *
 * @param {Joi.Schema|Object} schema
 *   A Joi schema, or a plain object whose keys are 'body', 'query', 'params'
 *   and whose values are Joi schemas (multi-target validation).
 * @param {'body'|'query'|'params'} [target='body']
 *   Which part of the request to validate (used only when schema is a Joi schema,
 *   not an object of schemas).
 * @param {Joi.ValidationOptions} [options]
 *   Override Joi options.
 */
const validate = (schema, target = 'body', options = {}) => {
  const defaultOptions = {
    abortEarly: false,   // report ALL errors, not just the first
    allowUnknown: false, // reject extra keys by default
    stripUnknown: true,  // silently remove unknown keys that pass the above
    ...options,
  };

  return (req, res, next) => {
    // ── Multi-target mode (schema is a plain object of Joi schemas) ───────────
    if (schema !== null && typeof schema === 'object' && !schema.validate) {
      const validationErrors = [];

      for (const [part, partSchema] of Object.entries(schema)) {
        if (!['body', 'query', 'params'].includes(part)) {
          continue; // skip unknown keys
        }

        const { error, value } = partSchema.validate(req[part] || {}, {
          ...defaultOptions,
          allowUnknown: part !== 'body', // allow unknown query params / route params
        });

        if (error) {
          const fieldErrors = error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message.replace(/['"]/g, ''),
          }));
          validationErrors.push(...fieldErrors);
        } else {
          req[part] = value; // replace with sanitised value
        }
      }

      if (validationErrors.length > 0) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        });
      }

      return next();
    }

    // ── Single-target mode ────────────────────────────────────────────────────
    const { error, value } = schema.validate(req[target] || {}, defaultOptions);

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));

      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req[target] = value; // replace with sanitised/coerced value
    next();
  };
};

/**
 * validateId
 * Convenience middleware that validates req.params.id is a valid MongoDB ObjectId.
 */
const validateId = (paramName = 'id') => {
  const schema = Joi.object({
    [paramName]: Joi.string()
      .pattern(/^[a-f\d]{24}$/i)
      .required()
      .messages({
        'string.pattern.base': `'${paramName}' must be a valid MongoDB ObjectId`,
        'any.required': `'${paramName}' is required`,
      }),
  });

  return (req, res, next) => {
    const { error } = schema.validate({ [paramName]: req.params[paramName] });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message.replace(/['"]/g, ''),
      });
    }

    next();
  };
};

module.exports = { validate, validateId };
