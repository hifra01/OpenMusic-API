const Joi = require('joi');

const mimeTypes = [
  'image/apng',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
];

const PictureHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(...mimeTypes).required(),
}).unknown();

module.exports = { PictureHeadersSchema };
