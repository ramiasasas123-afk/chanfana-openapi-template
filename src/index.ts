export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);

    if (url.pathname === "/api") {
      return getPosts();
    }

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
};

const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>الأخبار</title>
<style>
body{margin:0;font-family:tahoma;background:#f5f5f5}
.container{max-width:700px;margin:auto;padding:15px}
.post{background:#fff;margin-bottom:15px;border-radius:12px;overflow:hidden}
.post img{width:100%}
.content{padding:12px;line-height:1.8}
</style>
</head>
<body>

<div class="container">
<h2 style="text-align:center">آخر الأخبار</h2>
<div id="posts">جاري التحميل...</div>
</div>

<script>
fetch("/api")
.then(r=>r.json())
.then(data=>{
  let html="";
  data.forEach(p=>{
    html += `
      <div class="post">
        ${p.img ? `<img src="${p.img}" loading="lazy">` : ""}
        <div class="content">${p.text}</div>
      </div>
    `;
  });
  document.getElementById("posts").innerHTML = html;
});
</script>

</body>
</html>
`;

async function getPosts() {
  try {
    const res = await fetch("https://t.me/s/Alsharqiapulse", {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await res.text();

    const blocks = html.split("tgme_widget_message_wrap");
    const posts: any[] = [];

    for (let i = 1; i < blocks.length && posts.length < 20; i++) {
      const b = blocks[i];

      const textMatch = b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
      const imgMatch = b.match(/background-image:url\('(.*?)'\)/);

      let text = textMatch ? textMatch[1].replace(/<[^>]+>/g, "").trim() : "";
      let img = imgMatch ? imgMatch[1] : "";

      if (!text && !img) continue;

      posts.push({ text, img });
    }

    return new Response(JSON.stringify(posts), {
      headers: {
        "content-type": "application/json",
        "cache-control": "max-age=300"
      }
    });

  } catch (e) {
    return new Response("[]", {
      headers: { "content-type": "application/json" }
    });
  }
}
