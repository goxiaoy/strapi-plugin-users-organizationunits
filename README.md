# Strapi plugin users-organizationunits

Preview
![Screenshots](https://raw.githubusercontent.com/Goxiaoy/strapi-plugin-users-organizationunits/master/res/homepage.png)


Features:

- manage orgnization unit as tree structure
- link users and roles with one organization unit


Used UI component 

- [Ant-design](https://ant.design/)


The `organization-unit` service is portable from [Abp](https://github.com/abpframework/abp)

How to use:
--------
1. install package
    ```
    npm install strapi-plugin-users-organizationunits
    ```

2. update your current user schema. In you `extensions/users-permissions/models/User.settings.json` add attribute
   ```
    ...
    "attributes": {
        ...
        "organization_units": {
        "via": "users",
        "plugin": "users-organizationunits",
        "collection": "organization-unit"
        }
    }
    ...
   ```

3. to prevent user from editing organanization unit, you need to override plugin `content-manager`. copy original file to `extensions/content-manager/services/ContentTypes.js`. see more in [documentation](https://strapi.io/documentation/v3.x/concepts/customization.html#plugin-extensions)

    ```
        const HIDDEN_CONTENT_TYPES = [
        'strapi::admin',
        'plugins::upload.file',
        'plugins::users-permissions.permission',
        'plugins::users-permissions.role',
        'strapi::permission',
        'strapi::role',
        'strapi::user',
        +  'plugins::users-organizationunits.organization-unit'
        ];
    ```

Issues:
--------

- Have not tested in mongodb
- Add uses filter not work
- Performance issue
- Translation only in `en` and `zh`
- Concurrent editing

Author:

@Goxiaoy
@Wulabalabo



