'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 * https://github.com/mperk/abp/blob/37feb46d0f2d69169240565429de5fb51207280a/modules/identity/src/Volo.Abp.Identity.Domain/Volo/Abp/Identity/Organizations/OrganizationUnitManager.cs
 */
const { calculateNextCode, appendCode, createCode, getRelativeCode } = require('../utils/code');
module.exports = {
  /**
* Promise to fetch all records
*
* @return {Promise}
*/
  find(params, populate) {
    return strapi.query('organization-unit', 'users-organizationunits').find(params, populate);
  },
  /**
 * Promise to fetch record
 *
 * @return {Promise}
 */

  findOne(params, populate) {
    return strapi.query('organization-unit', 'users-organizationunits').findOne(params, populate);
  },
  /**
 * Promise to count record
 *
 * @return {Promise}
 */

  count(params) {
    return strapi.query('organization-unit', 'users-organizationunits').count(params);
  },
  /**
  * Promise to add record
  *
  * @return {Promise}
  */

  async create(data, { files } = {}) {
    data.code = await this.getNextChildCode(data.parent);
    await this.validate(data);
    const entry = await strapi.query('organization-unit', 'users-organizationunits').create(data);
    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'organization-unit', plugin: 'users-organizationunits'
        // if you are using a plugin's model you will have to add the `plugin` key (plugin: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },
  /**
   * Promise to edit record
   *
   * @return {Promise}
   */

  async update(params, data, { files } = {}) {
    await this.validate(data);
    var oldEntity = await this.findOne(params);
    if (typeof (data.parent) !== 'undefined') {
      if (data.parent != oldEntity.parent) {
        // move parent
        await this.move(params.id, data.parent);
      }
    }
    //update other fileds
    const entry = await strapi.query('organization-unit', 'users-organizationunits').update(params, data);

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'organization-unit', plugin: 'users-organizationunits',
        // if you are using a plugin's model you will have to add the `plugin` key (plugin: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },
  /**
   * Promise to delete a record
   *
   * @return {Promise}
   */

  async delete(params) {
    var children = await this.findChildren(params.id, true);
    var ids = children.map(p => p.id);
    ids.push(params.id);
    return await strapi.query('organization-unit', 'users-organizationunits').delete({ id_in: ids });
  },
  /**
   * Promise to search records
   *
   * @return {Promise}
   */

  search(params) {
    return strapi.query('organization-unit', 'users-organizationunits').search(params);
  },
  /**
   * Promise to count searched records
   *
   * @return {Promise}
   */
  countSearch(params) {
    return strapi.query('organization-unit', 'users-organizationunits').countSearch(params);
  },

  /**
   * @param  {} model
   * @return {Promise}
   */
  async validate(model) {

  },
  async normalizeModel(model) {
    //TODO set code
    //
  },
  /**
   * 
   * @param {string} parent 
   * @return 
   */
  async getNextChildCode(parent) {
    const data = await this.getChildren(parent);
    const lastChild = data.slice(-1)[0];
    if (lastChild == null) {
      const parentCode = parent != null ? await this.getCodeOrNull(parent) : null;
      return appendCode(parentCode, createCode([1]));
    } else {
      return calculateNextCode(lastChild.code);
    }
  },
  async getCodeOrNull(id) {
    const ou = await this.findOne({ id });
    return ou == null ? null : ou.code;
  },
  async findChildren(parent, recursive = false) {
    if (!recursive) {
      return this.getChildren(parent);
    }
    if (parent == null) {
      //return all nodes
      return await strapi.query('organization-unit', 'users-organizationunits').find({ _limit: -1 });
    }
    const code = await this.getCodeOrNull(parent);
    return this.getAllChildrenWithParentCode(code, parent);
  },
  /**
   * 
   * @param {string} parent 
   */
  async getChildren(parent) {
    return await this.find({ parent: parent, _sort: 'code:asc', _limit: -1 });
  },
  /**
   * 
   * @param {!string} code 
   * @param {string} parent 
   */
  async getAllChildrenWithParentCode(code, parent) {
    var ret = await strapi.query('organization-unit', 'users-organizationunits').custom(searchQueries)({
      code, parent
    });
    return ret;
  },
  /**
   * 
   * @param {!string} id 
   * @param {string} parent 
   */
  async move(id, parent) {
    if (parent === 'undefined') {
      parent = null;
    }
    var ou = await this.findOne({ id: id });
    if (ou.parent == parent) {
      return;
    }
    var children = await this.findChildren(id, true);
    var oldCode = ou.code;
    ou.code = await this.getNextChildCode(parent);
    ou.parent = parent;
    await strapi.query('organization-unit', 'users-organizationunits').update({ id }, ou);
    await this.validate(ou);
    for (const child of children) {
      child.code = appendCode(ou.code, getRelativeCode(child.code, oldCode));
      await strapi.query('organization-unit', 'users-organizationunits').update({ id: child.id }, child);
    }
  }
};


const searchQueries = {
  bookshelf({ model }) {
    return ({ code, parent }) => {
      return model
        .query(qb => qb.where("id", "<>", parent).andWhere("code", "like", `${code}%`)).fetchAll()
        .then(results => results.toJSON());
    };
  },
  mongoose({ model }) {

    return ({ code, parent }) => {
      //TODO

      // const re = new RegExp(id);
      return model.find({
        $and: [{ id: { $ne: parent } }, { code: {$regex: `${code}.*`} }],
      });
    };
  },
};