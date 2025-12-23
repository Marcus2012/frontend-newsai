"use strict";

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/articles/:id/approve',
      handler: 'article.approve',
      config: {
        auth: true,
        policies: []
      }
    }
    ,
    {
      method: 'POST',
      path: '/articles/import',
      handler: 'article.importFromExternal',
      config: {
        auth: false,
        policies: []
      }
    }
  ]
};
