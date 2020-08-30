'use strict';


const {validateBatch} = require('./validation/batch')
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

  const sanitizeOu = user =>
  sanitizeEntity(user, {
    model: strapi.query('organization-unit', 'users-organizationunits').model,
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
    var users;
    users = await strapi.plugins['users-organizationunits'].services['users-organizationunits'].findOuUsers(ctx.query, populate);
    ctx.body = users.map(sanitizeUser);
  },

  async countByOu(ctx) {
    var count = await strapi.plugins['users-organizationunits'].services['users-organizationunits'].countOuUsers(ctx.query);
    ctx.body = count;
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
      strapi.log.error(error);
      return ctx.send({
        error
      }, 400);
    }
    var entity= await strapi.plugins['users-organizationunits'].services["users-organizationunits"].addUsers(data.ouId, data.userIds);
    ctx.body = sanitizeOu(entity);
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
      strapi.log.error(error);
      console.log(error)
      return ctx.send({
        error
      }, 400);
    }
    var entity=  await strapi.plugins['users-organizationunits'].services["users-organizationunits"].removeUsers(data.ouId, data.userIds);
    ctx.body = sanitizeOu(entity);
  }
};
