import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const LOGO = "https://media.base44.com/images/public/69b73bf820481df67e8a6ca5/6ea43a872_logo.png";
const FALLBACK_ORIGIN = "https://flinteats.base44.app";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

    const clean = (post.content || "").replace(/\s+/g, " ").trim();
    const author = post.author_name || "A Flint Eats member";
    // Cut on word boundaries so previews never start or end mid-word.
    const clip = (text, max) => {
      if (text.length <= max) return text;
      const cut = text.slice(0, max);
      const space = cut.lastIndexOf(" ");
      return `${space > max * 0.6 ? cut.slice(0, space) : cut}…`;
    };
    const headline = clean ? clip(clean, 110) : `${author} shared a photo on Flint Eats`;
    const headlineWords = clean && clean.length > 110 ? clean.slice(0, 110).lastIndexOf(" ") : 0;
    const tail = headlineWords > 0 ? clip(clean.slice(headlineWords).trim(), 200) : "";
    const description = [author, post.category, tail || "Community food, recipes and resources in Genesee County."]
      .filter(Boolean)
      .join(" · ");

    const image = post.image_url || LOGO;
    const shareUrl = `${origin}/functions/sharePost?id=${encodeURIComponent(post.id)}`;
    const appLink = `${origin}/Feed?post=${encodeURIComponent(post.id)}`;

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
<link rel="icon" type="image/png" href="${LOGO}" />
<style>
  body { margin: 0; background: #f6f7f6; font-family: Arial, Helvetica, sans-serif; color: #0a0a0a; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 24px 16px 48px; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
  .brand img { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
  .brand span { font-weight: 700; color: #15803d; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; }
  .card img.hero { width: 100%; display: block; }
  .body { padding: 18px 20px 22px; }
  .meta { font-size: 13px; color: #475569; margin-bottom: 8px; }
  .text { font-size: 16px; line-height: 1.55; white-space: pre-wrap; }
  .cta { display: block; text-align: center; margin-top: 20px; background: #15803d; color: #fff; text-decoration: none; padding: 14px 18px; border-radius: 24px; font-weight: 700; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand"><img src="${LOGO}" alt="Flint Eats" /><span>Flint Eats</span></div>
    <div class="card">
      ${post.image_url ? `<img class="hero" src="${esc(post.image_url)}" alt="${esc(headline)}" />` : ""}
      <div class="body">
        <div class="meta">${esc(author)}${post.category ? ` · ${esc(post.category)}` : ""}</div>
        <div class="text">${esc(post.content || "")}</div>
        <a class="cta" href="${esc(appLink)}">Open in Flint Eats</a>
      </div>
    </div>
  </div>
  <script>setTimeout(function () { window.location.replace(${JSON.stringify(appLink)}); }, 400);</script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}