'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.plugins['users-organizationunits'].io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
      /**
   * Retrieve records.
   *
   * @return {Array}
   */
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.plugins['users-organizationunits'].services["organization-unit"].search(ctx.query);
    } else {
      entities = await strapi.plugins['users-organizationunits'].services["organization-unit"].find(ctx.query);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.plugins['users-organizationunits'].models["organization-unit"] }));
  },
    /**
   * Retrieve a record.
   *
   * @return {Object}
   */

  async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.plugins['users-organizationunits'].services["organization-unit"].findOne({ id });
    return sanitizeEntity(entity, { model: strapi.plugins['users-organizationunits'].models["organization-unit"] });
  },
    /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.plugins['users-organizationunits'].services["organization-unit"].create(data, { files });
    } else {
      entity = await strapi.plugins['users-organizationunits'].services["organization-unit"].create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.plugins['users-organizationunits'].models["organization-unit"] });
  },
  /**
   * Count records.
   *
   * @return {Number}
   */

  count(ctx) {
    if (ctx.query._q) {
      return strapi.plugins['users-organizationunits'].services["organization-unit"].countSearch(ctx.query);
    }
    return strapi.plugins['users-organizationunits'].services["organization-unit"].count(ctx.query);
  },
  /**
   * Update a record.
   *
   * @return {Object}
   */

  async update(ctx) {
    const { id } = ctx.params;
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.plugins['users-organizationunits'].services["organization-unit"].update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.plugins['users-organizationunits'].services["organization-unit"].update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.plugins['users-organizationunits'].models["organization-unit"] });
  },
    /**
   * delete a record.
   *
   * @return {Object}
   */

  async delete(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.plugins['users-organizationunits'].services["organization-unit"].delete({ id });
    return sanitizeEntity(entity, { model: strapi.plugins['users-organizationunits'].models["organization-unit"] });
  },
  /**
   * move 
   * @param {*} ctx 
   */
  async move(ctx) {
    const {id,parent} = ctx.request.body;
    if(id == null){
      return  ctx.badRequest('id required');
    }
    await strapi.plugins['users-organizationunits'].services["organization-unit"].move(id,parent);
    ctx.send({
      ok: true
    });
  }
};
