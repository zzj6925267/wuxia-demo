#!/usr/bin/env node
/**
 * 万相「参考图」出图：在终端运行，打印新图 URL。
 *
 * 使用前请准备：
 *   1) 环境变量 DASHSCOPE_API_KEY（百炼控制台申请的 sk-...）
 *   2) 参考图必须是「公网能打开的 https 图片链接」，不能写本机 E:\...\xx.png
 *   3) 用中文写你想画什么（--prompt）
 *
 * 一条命令示例（PowerShell 先 cd 到 wuxia-demo 目录）：
 *   $env:DASHSCOPE_API_KEY="sk-你的"
 *   node scripts/wanx_reference_image.mjs --ref "https://图床/xxx.png" --prompt "黑底胸像，老年男山贼" --mode refonly --strength 0.55
 *
 * 可选参数：--negative "..."  --size 1280*720  --model wanx-v1
 * 查看帮助：node scripts/wanx_reference_image.mjs --help
 *
 * ref_mode：refonly=主要学画风；repaint=更贴原图内容改图。
 * 官方文档：https://help.aliyun.com/zh/model-studio/text-to-image-api-reference
 */

import process from "node:process";

const BASE = "https://dashscope.aliyuncs.com/api/v1";
const CREATE_PATH = "/services/aigc/text2image/image-synthesis";
const POLL_INTERVAL_MS = 2500;
const POLL_MAX_MS = 120000;

function parseArgs(argv) {
  const out = {
    ref: "",
    prompt: "",
    negative: "低质量, 模糊, 水印, 文字",
    mode: "refonly",
    strength: 0.65,
    size: "1280*720",
    model: "wanx-v1",
    n: 1,
    style: "<auto>",
    watermark: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--ref" && next) {
      out.ref = next;
      i++;
    } else if (a === "--prompt" && next) {
      out.prompt = next;
      i++;
    } else if (a === "--negative" && next) {
      out.negative = next;
      i++;
    } else if (a === "--mode" && next) {
      out.mode = next;
      i++;
    } else if (a === "--strength" && next) {
      out.strength = parseFloat(next, 10);
      i++;
    } else if (a === "--size" && next) {
      out.size = next;
      i++;
    } else if (a === "--model" && next) {
      out.model = next;
      i++;
    } else if (a === "--n" && next) {
      out.n = parseInt(next, 10);
      i++;
    } else if (a === "--style" && next) {
      out.style = next;
      i++;
    } else if (a === "--watermark") {
      out.watermark = true;
    } else if (a === "--help" || a === "-h") {
      out.help = true;
    }
  }
  return out;
}

function printHelp() {
  console.log(`
=== 万相参考图出图（终端脚本）===

你要做的只有四件事：
  1. 安装过 Node.js，在本项目 wuxia-demo 目录打开终端。
  2. 把参考图传到网上，复制 https 图片地址（不要用本地盘符路径）。
  3. 设置环境变量：DASHSCOPE_API_KEY=你的百炼 API Key。
  4. 运行下面这种一行命令，等结束，最后一行就是新图链接。

命令格式：
  node scripts/wanx_reference_image.mjs --ref "https://.../图.png" --prompt "中文描述画面"

常用可选参数：
  --negative "不要出现的内容，逗号分隔"
  --mode refonly      只学画风（默认，换角色时用）
  --mode repaint      更贴原图内容改
  --strength 0.55     越大越像参考图，约 0.45~0.75 之间试
  --size 1280*720     横图；或 1024*1024 方图
  --model wanx-v1     与官方参考图示例一致
  --watermark         显式加右下角「AI生成」水印（默认不加）

PowerShell 一行示例：
  $env:DASHSCOPE_API_KEY="sk-xxxx"; node scripts/wanx_reference_image.mjs --ref "https://example.com/ref.png" --prompt "黑底胸像，女侠，红衣" --mode refonly --strength 0.55
`);
}

async function createTask(apiKey, body) {
  const res = await fetch(`${BASE}${CREATE_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json.message || json.code || res.statusText;
    throw new Error(`创建任务失败 HTTP ${res.status}: ${msg}\n${JSON.stringify(json)}`);
  }
  const taskId = json.output?.task_id;
  if (!taskId) throw new Error(`无 task_id：${JSON.stringify(json)}`);
  return taskId;
}

async function pollTask(apiKey, taskId) {
  const url = `${BASE}/tasks/${taskId}`;
  const start = Date.now();
  while (Date.now() - start < POLL_MAX_MS) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`查询失败 HTTP ${res.status}: ${JSON.stringify(json)}`);
    }
    const st = json.output?.task_status;
    if (st === "SUCCEEDED") {
      const results = json.output?.results || [];
      const urls = results.map((r) => r.url).filter(Boolean);
      if (!urls.length) throw new Error(`成功但无 URL：${JSON.stringify(json)}`);
      return urls;
    }
    if (st === "FAILED") {
      throw new Error(
        `任务失败: ${json.output?.code || ""} ${json.output?.message || JSON.stringify(json.output)}`
      );
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error("轮询超时，请稍后在控制台用 task_id 再查或重试");
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    console.error("请设置环境变量 DASHSCOPE_API_KEY");
    process.exit(1);
  }
  if (!args.ref || !args.prompt) {
    console.error("缺少 --ref 或 --prompt");
    printHelp();
    process.exit(1);
  }
  if (!["refonly", "repaint"].includes(args.mode)) {
    console.error("--mode 只能是 refonly 或 repaint");
    process.exit(1);
  }

  const body = {
    model: args.model,
    input: {
      prompt: args.prompt,
      negative_prompt: args.negative,
      ref_image: args.ref,
    },
    parameters: {
      style: args.style,
      size: args.size,
      n: args.n,
      ref_strength: args.strength,
      ref_mode: args.mode,
      watermark: args.watermark,
    },
  };

  console.error("创建任务…");
  const taskId = await createTask(apiKey, body);
  console.error("task_id:", taskId);
  console.error("轮询结果…");
  const urls = await pollTask(apiKey, taskId);
  for (const u of urls) console.log(u);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
