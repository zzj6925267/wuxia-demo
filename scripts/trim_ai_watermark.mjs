#!/usr/bin/env node
/**
 * 批量裁掉右下角「AI生成」水印区（网页/部分通道出图常见）。
 * 不调用第三方去水印模型，仅做像素裁切；适合招式图标等小图。
 *
 * 依赖：在 wuxia-demo/tools/portrait-crop 下执行过 npm install（sharp）。
 *
 * 用法（PowerShell，先 cd 到 wuxia-demo）：
 *   node scripts/trim_ai_watermark.mjs --dir game/assets/images/UI/skills
 *   node scripts/trim_ai_watermark.mjs --file game/assets/images/UI/skills/ma_skill_1_1.png --inplace
 *   node scripts/trim_ai_watermark.mjs --dir game/assets/images/UI/skills --right 0.14 --bottom 0.1 --size 128 --inplace
 */
import { existsSync, readdirSync, copyFileSync, unlinkSync } from "node:fs";
import { dirname, join, resolve, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const requireFromPortraitCrop = createRequire(
  join(root, "tools", "portrait-crop", "package.json")
);

let sharp;
try {
  sharp = requireFromPortraitCrop("sharp");
} catch (e) {
  console.error(
    "未找到 sharp。请执行：cd tools/portrait-crop && npm install\n然后回到 wuxia-demo 再运行本脚本。"
  );
  process.exit(1);
}

function parseArgs(argv) {
  const out = {
    dir: "",
    file: "",
    right: 0.14,
    bottom: 0.1,
    size: 0,
    inplace: false,
    suffix: "_nowm",
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--dir" && next) {
      out.dir = next;
      i++;
    } else if (a === "--file" && next) {
      out.file = next;
      i++;
    } else if (a === "--right" && next) {
      out.right = parseFloat(next);
      i++;
    } else if (a === "--bottom" && next) {
      out.bottom = parseFloat(next);
      i++;
    } else if (a === "--size" && next) {
      out.size = parseInt(next, 10);
      i++;
    } else if (a === "--suffix" && next) {
      out.suffix = next;
      i++;
    } else if (a === "--inplace") {
      out.inplace = true;
    } else if (a === "--help" || a === "-h") {
      out.help = true;
    }
  }
  return out;
}

function printHelp() {
  console.log(`
裁切右下角水印区（默认裁掉宽 14% × 高 10% 的矩形，即去掉右下条带）。

  node scripts/trim_ai_watermark.mjs --dir game/assets/images/UI/skills
  node scripts/trim_ai_watermark.mjs --file path/to.png --inplace
  node scripts/trim_ai_watermark.mjs --dir ... --right 0.16 --bottom 0.12 --size 128 --inplace

  --inplace     覆盖原文件（会先写 .bak 备份）
  --size 128    裁切后再缩放到正方（招式图标用）
`);
}

function listPngFiles(dir) {
  return readdirSync(dir)
    .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
    .map((f) => join(dir, f));
}

async function processOne(inputPath, args) {
  const meta = await sharp(inputPath).metadata();
  const w = meta.width || 0;
  const h = meta.height || 0;
  if (!w || !h) throw new Error("无法读取尺寸: " + inputPath);

  const cropW = Math.max(1, Math.floor(w * (1 - args.right)));
  const cropH = Math.max(1, Math.floor(h * (1 - args.bottom)));

  let pipeline = sharp(inputPath).extract({
    left: 0,
    top: 0,
    width: cropW,
    height: cropH,
  });

  if (args.size > 0) {
    pipeline = pipeline.resize(args.size, args.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }

  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  const dir = dirname(inputPath);
  const outPath = args.inplace
    ? inputPath
    : join(dir, base + args.suffix + ext);

  if (args.inplace) {
    const bak = inputPath + ".bak";
    if (!existsSync(bak)) copyFileSync(inputPath, bak);
    await pipeline.png().toFile(inputPath + ".tmp.png");
    copyFileSync(inputPath + ".tmp.png", inputPath);
    try {
      unlinkSync(inputPath + ".tmp.png");
    } catch (e) {
      /* ignore */
    }
  } else {
    await pipeline.png().toFile(outPath);
  }

  console.log(
    "OK",
    basename(inputPath),
    `${w}x${h}`,
    "→",
    args.inplace ? "inplace" : basename(outPath),
    `crop ${cropW}x${cropH}`,
    args.size ? `resize ${args.size}` : ""
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const files = [];
  if (args.file) files.push(resolve(root, args.file));
  if (args.dir) {
    const d = resolve(root, args.dir);
    if (!existsSync(d)) {
      console.error("目录不存在:", d);
      process.exit(1);
    }
    files.push(...listPngFiles(d));
  }
  if (!files.length) {
    console.error("请指定 --file 或 --dir");
    printHelp();
    process.exit(1);
  }

  for (const f of files) {
    if (!existsSync(f)) {
      console.warn("跳过（不存在）", f);
      continue;
    }
    await processOne(f, args);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
