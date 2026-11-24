import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const LOGO = "https://media.base44.com/images/public/69b73bf820481df67e8a6ca5/6ea43a872_logo.png";
const FALLBACK_ORIGIN = "https://flinteats.base44.app";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const linkify = (s) =>
  esc(s).replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);

const timeAgo = (iso) => {
  const then = new Date(iso).getTime();
  if (!then) return "";
  const secs = Math.floor((Date.now() - then) / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const CATEGORY_STYLES = {
  Recipe: ["#dcfce7", "#166534"],
  "Resource Tip": ["#dbeafe", "#1e40af"],
  "Community News": ["#ede9fe", "#5b21b6"],
  Event: ["#fef3c7", "#92400e"],
  Question: ["#e0f2fe", "#075985"],
  "Success Story": ["#ffedd5", "#9a3412"],
  General: ["#f1f5f9", "#334155"],
};

export default async function (req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const origin = req.headers.get("X-Base44-App-Url") || FALLBACK_ORIGIN;

    if (!id) return Response.redirect(`${origin}/Feed`, 302);

    const base44 = createClientFromRequest(req);
    const post = await base44.asServiceRole.entities.Post.get(id).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );

    if (!post || post.is_published === false) {
      return Response.redirect(`${origin}/Feed`, 302);
    }

    const [authorRecord, comments] = await Promise.all([
      post.author_email
        ? base44.asServiceRole.entities.User.filter({ email: post.author_email }, "-created_date", 1)
            .then((rows) => rows[0] || null)
            .catch(() => null)
        : Promise.resolve(null),
      base44.asServiceRole.entities.Comment.filter({ post_id: post.id }, "-created_date", 3)
        .catch(() => []),
    ]);

    const clean = (post.content || "").replace(/[ \t]+/g, " ").trim();
    const author = post.author_name || "A Flint Eats member";
    const clip = (text, max) => {
      if (text.length <= max) return text;
      const cut = text.slice(0, max);
      const space = cut.lastIndexOf(" ");
      return `${space > max * 0.6 ? cut.slice(0, space) : cut}…`;
    };
    const headline = clean ? clip(clean.replace(/\s+/g, " "), 110) : `${author} shared a photo on Flint Eats`;
    const headlineWords = clean && clean.length > 110 ? clean.slice(0, 110).lastIndexOf(" ") : 0;
    const tail = headlineWords > 0 ? clip(clean.slice(headlineWords).trim().replace(/\s+/g, " "), 200) : "";
    const description = [author, post.category, tail || "Community food, recipes and resources in Genesee County."]
      .filter(Boolean)
      .join(" · ");

    const image = post.image_url || LOGO;
    const shareUrl = `${origin}/functions/sharePost?id=${encodeURIComponent(post.id)}`;
    const appLink = `${origin}/Feed?post=${encodeURIComponent(post.id)}`;

    const avatar = authorRecord?.profile_image_url;
    const initials = author.trim().charAt(0).toUpperCase() || "F";
    const [badgeBg, badgeText] = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.General;
    const likeCount = post.likes || 0;
    const commentCount = post.comment_count || 0;

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(headline)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Flint Eats" />
<meta property="og:title" content="${esc(headline)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:alt" content="${esc(headline)}" />
<meta property="og:url" content="${esc(shareUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(headline)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta name="theme-color" content="#15803d" />
<link rel="icon" type="image/png" href="${LOGO}" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #f6f7f6; font-family: Arial, Helvetica, sans-serif; color: #0a0a0a; -webkit-text-size-adjust: 100%; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 16px 14px 48px; }
  .brand { display: flex; align-items: center; gap: 10px; margin: 4px 0 16px; text-decoration: none; }
  .brand img { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; }
  .brand span { font-weight: 700; font-size: 17px; color: #15803d; letter-spacing: -0.2px; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; }
  .head { display: flex; align-items: center; gap: 11px; padding: 16px 18px 12px; }
  .avatar { width: 42px; height: 42px; border-radius: 999px; object-fit: cover; background: #dcfce7; color: #15803d; font-weight: 700; font-size: 17px; display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }
  .who { min-width: 0; flex: 1; }
  .name { font-weight: 700; font-size: 15px; line-height: 1.25; overflow-wrap: anywhere; }
  .sub { font-size: 12.5px; color: #64748b; margin-top: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .badge { font-size: 11.5px; font-weight: 700; padding: 2.5px 8px; border-radius: 999px; background: ${badgeBg}; color: ${badgeText}; }
  .content { padding: 2px 18px 16px; font-size: 16px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }
  .content a { color: #15803d; }
  .media { display: block; width: 100%; max-height: 640px; object-fit: cover; background: #0a0a0a; }
  video.media { max-height: none; object-fit: contain; }
  .tag { display: flex; align-items: center; gap: 7px; margin: 0 18px 16px; padding: 10px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; font-size: 13.5px; color: #14532d; font-weight: 600; text-decoration: none; }
  .tag span.pin { font-size: 14px; }
  .stats { display: flex; align-items: center; gap: 18px; padding: 0 18px 14px; font-size: 13.5px; color: #475569; font-weight: 600; }
  .stats div { display: flex; align-items: center; gap: 5px; }
  .comments { border-top: 1px solid #eef1f0; padding: 14px 18px 4px; }
  .comments h3 { margin: 0 0 10px; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; }
  .comment { margin-bottom: 12px; font-size: 14px; line-height: 1.5; }
  .comment b { display: block; font-size: 13px; margin-bottom: 2px; }
  .comment p { margin: 0; color: #334155; white-space: pre-wrap; overflow-wrap: anywhere; }
  .cta { display: block; text-align: center; margin-top: 18px; background: #15803d; color: #fff; text-decoration: none; padding: 15px 18px; border-radius: 999px; font-weight: 700; font-size: 15.5px; }
  .foot { text-align: center; font-size: 12.5px; color: #64748b; margin-top: 16px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="wrap">
    <a class="brand" href="${esc(origin)}/Feed"><img src="${LOGO}" alt="Flint Eats" /><span>Flint Eats</span></a>
    <div class="card">
      <div class="head">
        ${avatar
          ? `<img class="avatar" src="${esc(avatar)}" alt="${esc(author)}" />`
          : `<div class="avatar">${esc(initials)}</div>`}
        <div class="who">
          <div class="name">${esc(author)}</div>
          <div class="sub">
            ${post.category ? `<span class="badge">${esc(post.category)}</span>` : ""}
            <span>${esc(timeAgo(post.created_date))}</span>
          </div>
        </div>
      </div>
      ${clean ? `<div class="content">${linkify(post.content)}</div>` : ""}
      ${post.video_url
        ? `<video class="media" controls playsinline preload="metadata" src="${esc(post.video_url)}"></video>`
        : post.image_url
          ? `<img class="media" src="${esc(post.image_url)}" alt="${esc(headline)}" />`
          : ""}
      ${post.resource_name
        ? `<a class="tag" href="${esc(origin)}/Directory"><span class="pin">📍</span>${esc(post.resource_name)}</a>`
        : ""}
      <div class="stats">
        <div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9A5.6 5.6 0 0 1 12 5.6 5.6 5.6 0 0 1 21.6 12C19.5 16.4 12 21 12 21z"/></svg>
          ${likeCount} ${likeCount === 1 ? "like" : "likes"}
        </div>
        <div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z"/></svg>
          ${commentCount} ${commentCount === 1 ? "comment" : "comments"}
        </div>
      </div>
      ${comments.length
        ? `<div class="comments">
            <h3>Comments</h3>
            ${comments
              .map(
                (c) => `<div class="comment"><b>${esc(c.author_name || "A neighbor")}</b><p>${linkify(c.content)}</p></div>`
              )
              .join("")}
          </div>`
        : ""}
    </div>
    <a class="cta" href="${esc(appLink)}">Open in Flint Eats</a>
    <div class="foot">Community food, recipes and resources in Genesee County.</div>
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60" },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}