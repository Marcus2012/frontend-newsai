"use strict";

module.exports = {
  async approve(ctx) {
    const { id } = ctx.params;
    if (!id) return ctx.badRequest('Missing id');
    try {
      const entity = await strapi.entityService.findOne('api::article.article', id, { populate: ['image'] });
      if (!entity) return ctx.notFound();

      const user = ctx.state.user || null;
      const approvedBy = user ? (user.username || user.email || String(user.id)) : 'system';
      const updated = await strapi.entityService.update('api::article.article', id, {
        data: {
          publishedAt: new Date(),
          approvedBy,
          approvedAt: new Date()
        }
      });

      ctx.send({ data: updated });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
  ,
  async importFromExternal(ctx) {
    try {
      const syncSecret = process.env.STRAPI_SYNC_SECRET;
      if (syncSecret) {
        const incoming = ctx.request.headers['x-sync-secret'] || (ctx.request.body && ctx.request.body.sync_secret);
        if (!incoming || String(incoming) !== String(syncSecret)) {
          return ctx.unauthorized('Invalid sync secret');
        }
      }

      const payload = ctx.request.body;
      const items = Array.isArray(payload.items) ? payload.items : (payload.item ? [payload.item] : (payload ? (Array.isArray(payload) ? payload : [payload]) : []));

      if (!items || items.length === 0) return ctx.badRequest('No items provided');

      const results = [];
      for (const i of items) {
        const externalId = i.id || i.external_id || i.uuid || null;
        const data = {
          title: i.title || i.headline || 'Untitled',
          slug: i.slug || undefined,
          content: i.content || i.body || '',
          excerpt: i.excerpt || i.summary || '',
          category: i.category || i.section || '',
          author: i.author || i.by || '',
          source_url: i.source_url || i.url || '',
          external_id: externalId || undefined,
          publishedAt: i.publishedAt || i.published_at || null
        };

        // try find existing by external_id
        let existing = null;
        if (externalId) {
          const found = await strapi.entityService.findMany('api::article.article', {
            filters: { external_id: externalId },
            limit: 1
          });
          if (found && found.length) existing = found[0];
        }

        if (existing) {
          const updated = await strapi.entityService.update('api::article.article', existing.id, { data });
          results.push({ action: 'updated', id: updated.id, external_id: externalId });
        } else {
          const created = await strapi.entityService.create('api::article.article', { data });
          results.push({ action: 'created', id: created.id, external_id: externalId });
        }
      }

      ctx.send({ processed: results.length, results });
    } catch (err) {
      ctx.throw(500, err);
    }
  }
};
