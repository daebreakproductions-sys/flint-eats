import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user's posts
    const posts = await base44.asServiceRole.entities.Post.filter({ author_email: user.email });
    for (const post of posts) {
      await base44.asServiceRole.entities.Post.delete(post.id);
    }

    // Delete all user's comments
    const comments = await base44.asServiceRole.entities.Comment.filter({ author_email: user.email });
    for (const comment of comments) {
      await base44.asServiceRole.entities.Comment.delete(comment.id);
    }

    // Delete all user's reviews
    const reviews = await base44.asServiceRole.entities.Review.filter({ user_email: user.email });
    for (const review of reviews) {
      await base44.asServiceRole.entities.Review.delete(review.id);
    }

    // Delete all user's RSVPs
    const rsvps = await base44.asServiceRole.entities.RSVP.filter({ user_email: user.email });
    for (const rsvp of rsvps) {
      await base44.asServiceRole.entities.RSVP.delete(rsvp.id);
    }

    // Delete the user account itself
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});