'use strict';
const _ = require('lodash');
/**
 * users-organizationunits.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {

    async removeUsers(ouId, userIds) {
        var ou = await strapi.query('organization-unit', 'users-organizationunits').findOne({ id: ouId });
        ou.users = ou.users.filter(x=>!userIds.some(y=>y==x.id));
        ou = await strapi.query('organization-unit', 'users-organizationunits').update({id:ou.id},ou);
        return ou;
    },
    async addUsers(ouId, userIds) {
        var ou = await strapi.query('organization-unit', 'users-organizationunits').findOne({ id: ouId });
        var newUsers = _.uniqBy(ou.users.map(p=>{return {id:p.id}}).concat(userIds.map(p=>{return {id:p}})),"id");
        console.log(ou.users.map(p=>{return {id:p.id}}).concat(userIds.map(p=>{return {id:p}})));
        ou.users = newUsers;
        ou = await strapi.query('organization-unit', 'users-organizationunits').update({id:ou.id},ou);
        return ou;
    },
    async findOuUsers(params, populate) {
        let users;
        if (_.has(params, '_q')) {
            // use core strapi query to search for users
            users = await strapi.query('user', 'users-permissions').search(params, populate);
        } else {
            users = await strapi.query('user', 'users-permissions').find(params, populate);
        }
        return users;
    },
    async countOuUsers(params) {
        let users;
        if (_.has(params, '_q')) {
            // use core strapi query to search for users
            users = await strapi.query('user', 'users-permissions').countSearch(params);
        } else {
            users = await strapi.query('user', 'users-permissions').count(params);
        }
        return users;
    },
};
