import Joi from "joi";

export const openAIRequestSchema = Joi.object().keys({
  prompt: Joi.string().required(),
  apiKey: Joi.string().required(),
});
