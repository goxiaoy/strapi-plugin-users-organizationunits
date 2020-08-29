'use strict';

const validateBatch = require('./validation/batch')
/**
 * users-organizationunits.js controller
 *
 * @description: A set of functions called "actions" of the `users-organizationunits` plugin.
 */
const { sanitizeEntity } = require('strapi-utils');

const sanitizeUser = user =>
  sanitizeEntity(user, {
    model: strapi.query('user', 'users-permissions').model,
  });


module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },
  /**
   * find users under one ou
   * @param {*} ctx 
   */
  async findByOu(ctx, { populate } = {}) {
    const {
      id
    } = ctx.params;
    var users;
    users = await strapi.plugins['users-organizationunits'].services['users-organizationunits'].findOuUsers(id, ctx.query, populate);
    ctx.body = users.map(sanitizeUser);
  },
  /**
   * batch add to ou
   * @param {} ctx 
   */
  async addToOu(ctx) {
    var data = null;
    try {
      data = await validateBatch(ctx.request.body);
    } catch (error) {
      return ctx.send({
        error
      }, 400);
    }
    return await strapi.plugins['users-organizationunits'].services["users-organizationunits"].addUsers(data.ouId, data.userIds);
  },
  /**
   * batch remove from ou
   * @param {*} ctx 
   */
  async removeFromOu(ctx) {
    var data = null;
    try {
      data = await validateBatch(ctx.request.body);
    } catch (error) {
      return ctx.send({
        error
      }, 400);
    }
    return await strapi.plugins['users-organizationunits'].services["users-organizationunits"].removeUsers(data.ouId, data.userIds);
  }
};
