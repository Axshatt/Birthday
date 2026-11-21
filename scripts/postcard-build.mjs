// Keep the downloadable card at a stable address across clean builds.
import { readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
const root = "dist";
let html = await readFile(join(root, "postcard.html"), "utf8");
const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const style = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if (!script || !style) throw new Error("Missing postcard build entry");
const js = await readFile(join(root, script[1]), "utf8");
const css = await readFile(join(root, style[1]), "utf8");
// Inline the entry so cached HTML never points to a retired hashed bundle.
html = html.replace(script[0], "").replace(style[0], () => "<style>"+css+"</style>")
  .replace("</body>", () => '<script type="module">'+js.replace(/<\/script/gi,"<\\/script")+'</script></body>');
await writeFile(join(root, "index.html"), html);
const paths = ["art/berry.png","art/pixel.ttf","art/world.png","art/cake-lit.png","art/cake-out.png","photos/shivangi.webp","photos/strawberry.webp",...["pop","cheer","boing","jingle"].map(name=>"sounds/"+name+".wav")];
const mime = {".webp":"image/webp",".png":"image/png",".wav":"audio/wav",".ttf":"font/ttf"};
const assets = Object.fromEntries(await Promise.all(paths.map(async path => [path,"data:"+mime[extname(path)]+";base64,"+(await readFile(join(root,path))).toString("base64")])));
const standalone = html.replace("./art/berry.png",assets["art/berry.png"]).replace("<head>",()=>"<head><script>window.postcardAssets="+JSON.stringify(assets)+"</script>");
await writeFile(join(root,"Birthday-Postcard.html"),standalone);

// Branch-based Pages serves the repository root. Use the existing public assets there.
await writeFile("index.html", html.replace("<head>", '<head><base href="./public/">'));
