import Joi from 'joi'
import config from '../config'

const schema = Joi.object().keys({
  format: Joi.string().valid('jpg', 'jpeg', 'png').required(),
  key: Joi.string().required(),
  quality: Joi.number().integer().min(0).max(100),
  width: Joi.number().integer().min(0).max(config.maximumSupportedWidth).optional(),
  height: Joi.number().integer().min(0).max(config.maximumSupportedHeight).optional(),
  rotate: Joi.number().integer().min(0).max(360),
  crop: Joi.string().valid('north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'center').optional(),
  ratio: Joi.string().valid('min', 'max', 'stretch').optional(),
  embed: Joi.boolean().optional(),
  background: Joi.string().regex(/^(?:[0-9a-fA-F]{3}){1,2}$/).optional(),
})

export default (params) => {
  const { error, value } = Joi.validate(params, schema)
  return error ? Promise.reject(error) :  Promise.resolve(value);
}
