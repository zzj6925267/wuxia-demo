/**
 * 从武学概念图裁出萧云澈 / 苏清璃头像 PNG（尽量贴近原画风）。
 *
 * 用法（在 `wuxia-demo/tools/portrait-crop/` 下先 `npm install`）：
 *   node crop_avatars.mjs              # 默认：整图 martial_arts_wuxia_ui_mockup.png（1536×1024）
 *   node crop_avatars.mjs --strip      # 改用条图 martial_char_portrait_strip_reference.png（687×229）
 *
 * 规则：两人 **统一面朝右**；概念图里苏清璃朝左，导出前对右侧半身 **水平镜像 (flop)**。
 * 输出写入 `game/assets/images/UI/`，与 **`PLAYER_PORTRAIT_*`** / 战斗 `avatar` 同源，勿另存一套脸图。
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const outDir = join(root, "game", "assets", "images", "UI");

const strip = join(
  root,
  "game",
  "assets",
  "images",
  "UI",
  "martial_char_portrait_strip_reference.png"
);

const mockup = join(root, "game", "assets", "images", "UI", "martial_arts_wuxia_ui_mockup.png");

const useStrip = process.argv.includes("--strip");

async function writePng(pipeline, outName) {
  const outPath = join(outDir, outName);
  await pipeline.png().toFile(outPath);
  const m = await sharp(outPath).metadata();
  console.log("wrote", outName, m.width, m.height);
}

async function main() {
  const src = useStrip && existsSync(strip) ? strip : mockup;
  if (!existsSync(src)) {
    console.error("missing source:", src);
    process.exit(1);
  }

  const meta = await sharp(src).metadata();
  const W = meta.width;
  const H = meta.height;
  console.log("source", src, W, H);

  if (W === 687 && H === 229) {
    const mid = Math.floor(W / 2);
    const leftBuf = await sharp(src).extract({ left: 0, top: 0, width: mid, height: H }).toBuffer();
    const rightBuf = await sharp(src)
      .extract({ left: mid, top: 0, width: W - mid, height: H })
      .toBuffer();
    const facePad = { l: 52, t: 18, r: 48, b: 28 };
    const cropInner = async (buf, flopAfter) => {
      const m = await sharp(buf).metadata();
      const w = m.width - facePad.l - facePad.r;
      const h = m.height - facePad.t - facePad.b;
      let p = sharp(buf).extract({
        left: facePad.l,
        top: facePad.t,
        width: w,
        height: h,
      });
      if (flopAfter) p = p.flop();
      return p;
    };
    await writePng(await cropInner(leftBuf, false), "ma_ui_char_portrait_xiao_yunche.png");
    await writePng(await cropInner(rightBuf, true), "ma_ui_char_portrait_su_qingli.png");
    return;
  }

  if (W === 1536 && H === 1024) {
    const boxW = 270;
    const boxH = 255;
    const top = 118;
    const cx = W / 2;
    const gap = 52;
    const leftX = Math.round(cx - gap / 2 - boxW);
    const rightX = Math.round(cx + gap / 2);
    const faceTrim = { l: 38, t: 22, r: 32, b: 36 };

    const cropOne = async (left, outName, flopAfter) => {
      const buf = await sharp(src)
        .extract({ left, top, width: boxW, height: boxH })
        .toBuffer();
      const m = await sharp(buf).metadata();
      const w = m.width - faceTrim.l - faceTrim.r;
      const h = m.height - faceTrim.t - faceTrim.b;
      let p = sharp(buf).extract({
        left: faceTrim.l,
        top: faceTrim.t,
        width: w,
        height: h,
      });
      if (flopAfter) p = p.flop();
      await writePng(p, outName);
    };

    await cropOne(leftX, "ma_ui_char_portrait_xiao_yunche.png", false);
    await cropOne(rightX, "ma_ui_char_portrait_su_qingli.png", true);
    return;
  }

  console.error("Unexpected image size; add branch for", W, H);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
