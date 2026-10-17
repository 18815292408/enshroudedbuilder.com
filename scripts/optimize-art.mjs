// Converts generated source art in .local-art/ into web-sized WebP files in public/img/.
import sharp from "sharp";
import fs from "node:fs";
const src = new URL("../.local-art/", import.meta.url);
const out = new URL("../public/img/", import.meta.url);
for (const f of fs.readdirSync(src).filter((f) => f.endsWith(".png"))) {
  const name = f.replace(".png", "");
  const input = new URL(f, src).pathname;
  const sizes = name === "hero" ? [1920, 960] : [960, 480];
  for (const w of sizes) await sharp(input).resize({ width: w }).webp({ quality: 74 }).toFile(new URL(`${name}-${w}.webp`, out).pathname);
  if (name === "hero") await sharp(input).resize(1200, 630, { fit: "cover", position: "left" }).jpeg({ quality: 82 }).toFile(new URL("og-default.jpg", out).pathname);
  else await sharp(input).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 80 }).toFile(new URL(`og-${name}.jpg`, out).pathname);
}
console.log(fs.readdirSync(out).length, "files");
