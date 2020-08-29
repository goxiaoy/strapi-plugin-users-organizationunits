const _ = require('lodash');
const yup = require('yup');
const {
    formatYupErrors
} = require('strapi-utils');

const validateBatch = data => {
    return yup
        .object({
            ouId: yup.number().required(),
            userIds: yup.array().of(yup.number()).required()
        })
        .validate(data, {
            strict: true,
            abortEarly: false,
        })
        .catch(error => Promise.reject(formatYupErrors(error)));
}

module.exports = {
    validateBatch
}

