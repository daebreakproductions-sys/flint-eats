import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all resources in batches
    let allResources = [];
    let offset = 0;
    const batchSize = 500;
    while (true) {
      const batch = await base44.asServiceRole.entities.FoodResource.list('created_date', batchSize, offset);
      if (!batch || batch.length === 0) break;
      allResources = allResources.concat(batch);
      if (batch.length < batchSize) break;
      offset += batchSize;
    }

    // Group by source_id
    const groups = {};
    for (const r of allResources) {
      if (!r.source_id) continue;
      if (!groups[r.source_id]) groups[r.source_id] = [];
      groups[r.source_id].push(r);
    }

    // Collect duplicates (keep oldest, delete rest)
    const toDelete = [];
    for (const group of Object.values(groups)) {
      if (group.length <= 1) continue;
      group.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      toDelete.push(...group.slice(1));
    }

    if (toDelete.length === 0) {
      return Response.json({ deleted: 0, message: 'No duplicates found' });
    }

    // Delete one at a time with a delay to avoid rate limits
    let deleted = 0;
    for (const r of toDelete) {
      try {
        await base44.asServiceRole.entities.FoodResource.delete(r.id);
        deleted++;
      } catch (e) {
        // skip rate limited / already deleted
      }
      await new Promise(res => setTimeout(res, 150));
    }

    return Response.json({ deleted, total: allResources.length, message: `Deleted ${deleted} duplicates` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});