'use strict';
const _ = require('lodash');
/**
 * users-organizationunits.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {

    async removeUsers(ouId, userIds) {

    },
    async addUsers(ouId, userIds) {

    },
    async findOuUsers(ouId, params, populate) {
        let users;
        if (_.has(params, '_q')) {
            // use core strapi query to search for users
            users = await strapi.query('user', 'users-permissions').search({
                ...params,
                organization_units_contains: ouId
            }, populate);
        } else {
            users = await strapi.query('user', 'users-permissions').find({
                ...params,
                organization_units_contains: ouId
            }, populate);
        }
        return users;
    },

};
