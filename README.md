# 博仕达生物官网 — 完整开发文档

> **上海博仕达生物工程有限公司** 官方网站
> 线上地址：[https://tflabservice.com](https://tflabservice.com)
> GitHub：[https://github.com/Benny20260131/booster-website](https://github.com/Benny20260131/booster-website)
> 文档最后更新：2026年3月

---

## 目录

1. [项目简介](#1-项目简介)
2. [技术架构](#2-技术架构)
3. [本地开发环境搭建](#3-本地开发环境搭建)
4. [⚠️ 上线部署规范（必读）](#4-️-上线部署规范必读)
5. [目录结构](#5-目录结构)
6. [功能模块说明](#6-功能模块说明)
7. [数据文件说明](#7-数据文件说明)
8. [环境变量配置](#8-环境变量配置)
9. [Cloudflare Functions API](#9-cloudflare-functions-api)
10. [常见问题 & 故障排查](#10-常见问题--故障排查)
11. [产品数据维护](#11-产品数据维护)
12. [部署信息汇总](#12-部署信息汇总)
13. [版本历史](#13-版本历史)

---

## 1. 项目简介

博仕达生物官网是一个纯前端 React 单页应用（SPA），提供以下核心功能：

| 功能 | 说明 |
|------|------|
| 产品展示 | 7大分类、1900+ SKU、分页浏览、关键词搜索 |
| 产品详情 | 点击产品卡片查看详情、规格、相关产品、询价 |
| 用户注册 | 填写姓名/邮箱/国际手机号/公司/职位完成注册，发送欢迎邮件 |
| 用户登录 | 邮箱 OTP 验证码登录，10分钟有效，支持本地预览模式 |
| 产品询价 | 询价弹窗预填产品信息，提交后发送邮件至公司邮箱 |
| 联系留言 | 留言板提交后自动发邮件到公司邮箱 |
| 多语言 | 支持中文 / English 完整切换（含所有弹窗） |
| 解决方案 | 展示公司服务场景 |
| 视频背景 | 全页背景视频（Kling AI 生成，镜像显示） |

**产品分类（7大类）：**
- 🧪 实验耗材（吸头、PCR管/板、离心管、培养板等）
- ⚗️ 化学试剂与小分子
- 💊 质控试剂盒
- 🧫 早期研发
- 🔬 质控分析工具酶
- ⚗️ 超滤离心管
- 其他辅助耗材

---

## 2. 技术架构

```
┌─────────────────────────────────────────────────────┐
│                   浏览器 (SPA)                       │
│   React 18 + Vite 5 + Tailwind CSS                  │
│   booster-homepage.jsx（主组件，约 1500+ 行）         │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────────────┐
│              Cloudflare Pages                        │
│  • 静态文件托管 (dist/)                              │
│  • 自定义域名：tflabservice.com（SSL 已启用）         │
│  • Pages Functions：/api/contact / register          │
│                     /api/send-otp / verify-otp       │
└───────────────────┬─────────────────────────────────┘
                    │ 自动部署（git push 触发）
┌───────────────────▼─────────────────────────────────┐
│         GitHub (Benny20260131/booster-website)        │
│         分支：main → 推送即触发 Cloudflare 构建       │
└─────────────────────────────────────────────────────┘
                    │ 邮件发送
┌───────────────────▼─────────────────────────────────┐
│              Resend API                              │
│  from: service@tflabservice.com                      │
│  • OTP 验证码邮件                                    │
│  • 注册欢迎邮件 + 管理员通知                          │
│  • 询价/留言邮件                                     │
└─────────────────────────────────────────────────────┘
```

### 技术栈详情

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.3.1 |
| 构建工具 | Vite | 5.0.0 |
| CSS 框架 | Tailwind CSS | 3.4.13 |
| 图标库 | Lucide React | 0.446.0 |
| 部署平台 | Cloudflare Pages | — |
| 邮件服务 | Resend API | — |
| 图片优化 | Sharp | 0.34.5 |

---

## 3. 本地开发环境搭建

### 前提条件

- Node.js >= 18
- Git
- 项目路径：`C:\Users\Labbiotec\Desktop\2025博仕达\产品资料\OEM表格\booster-website`

### 安装与启动

```bash
# 1. 进入项目目录
cd "C:\Users\Labbiotec\Desktop\2025博仕达\产品资料\OEM表格\booster-website"

# 2. 安装依赖（首次或 package.json 更新后执行）
npm install

# 3. 启动本地开发服务器
npm run dev
# → 浏览器访问 http://localhost:5173
```

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热更新），访问 http://localhost:5173 |
| `npm run build` | 生产构建，输出到 `dist/` 目录 |
| `npm run preview` | 在本地预览构建后的生产版本，访问 http://localhost:4173 |
| `npm run image:status` | 查看图片处理进度 |

### 本地预览模式说明

由于 Cloudflare Pages Functions 在本地 `npm run dev` 时不运行，以下功能有特殊降级行为：

| 功能 | 本地行为 | 线上行为 |
|------|----------|---------|
| 发送 OTP 验证码 | 弹窗提示固定验证码 `888888` | 发送真实邮件到用户邮箱 |
| 注册 | 仅存入 localStorage，不发邮件 | 存 localStorage + 发欢迎邮件 |
| 询价提交 | 打开 `mailto:` 链接 | 直接发送邮件到 service@tflabservice.com |
| 联系留言 | 报错（正常现象） | 正常发邮件 |

---

## 4. ⚠️ 上线部署规范（必读）

> **严格要求：任何代码修改，必须先在本地完整验证无误，才能推送到 GitHub 触发线上部署。**
>
> 背景教训：曾因直接推送未经本地验证的代码，导致线上网站出现空白页（bundle 体积过大、组件报错），需多次紧急修复。**本地没问题 = 线上才没问题。**

### 上线前必须完成的 6 步检查

```
第 1 步：启动本地开发服务器
──────────────────────────────────────────────────────
命令：npm run dev
预期：终端显示 "Local: http://localhost:5173/"，无红色 ERROR

第 2 步：浏览器验证页面正常渲染
──────────────────────────────────────────────────────
操作：打开 http://localhost:5173
预期：
  ✅ 首页正常显示（博仕达 Logo、导航栏、背景视频）
  ✅ 没有空白页或纯白屏
  ❌ 若页面空白 → 直接看第 3 步

第 3 步：检查浏览器控制台（必做）
──────────────────────────────────────────────────────
操作：按 F12 → 切换到 Console（控制台）标签
预期：
  ✅ 没有红色 ERROR 报错
  ✅ 黄色 Warning 可忽略
  ❌ 若有红色错误，必须修复后才能继续

第 4 步：测试核心功能
──────────────────────────────────────────────────────
依次测试：
  ✅ 背景视频正常播放（镜像显示）
  ✅ Hero 搜索框输入关键词并跳转到产品列表
  ✅ 点击"注册"→ 填写表单 → 提交成功 → 顶部显示用户名
  ✅ 点击"退出" → 恢复登录/注册按钮
  ✅ 点击"登录" → 输入邮箱 → 本地显示 888888 → 登录成功
  ✅ 点击产品卡片 → 产品详情页正常打开
  ✅ 产品详情页点击"询价" → 询价弹窗正常显示，产品信息正确
  ✅ 语言切换（中文 / EN）正常，所有弹窗文字同步切换

第 5 步：执行生产构建
──────────────────────────────────────────────────────
命令：npm run build
预期：
  ✅ 终端末尾显示 "✓ XX modules transformed."
  ✅ 没有 ERROR（Warning 可忽略）
  ✅ dist/ 目录生成
  ❌ 若有 ERROR → 必须修复，不可推送

第 6 步：预览生产版本
──────────────────────────────────────────────────────
命令：npm run preview
操作：打开 http://localhost:4173，重复第 2-4 步检查
预期：生产版本与开发版本表现一致

══════════════════════════════════════════════════════
  ✅ 以上 6 步全部通过后，才可执行推送：
     git add src/booster-homepage.jsx（或具体文件）
     git commit -m "简要说明修改内容"
     git push origin main
  → Cloudflare 将自动构建并部署（约 1-3 分钟）
══════════════════════════════════════════════════════
```

### 部署完成后验证

```
推送后约 1-3 分钟，访问 https://tflabservice.com 确认线上版本正常
查看部署状态：Cloudflare Dashboard → Pages → booster-website → 最新部署
```

---

## 5. 目录结构

```
booster-website/
│
├── src/                              # 源代码
│   ├── main.jsx                      # React 入口（挂载 BoosterHomepage）
│   ├── index.css                     # 全局样式
│   ├── booster-homepage.jsx          # 主页面组件（核心业务逻辑，~1500 行）
│   │
│   └── data/                         # 数据层
│       ├── all-products.json         # 产品数据库（1961 条 SKU）
│       ├── product-image-map.json    # SKU → 图片映射（4735 条）
│       └── imageLoader.js            # 图片加载模块（统一获取接口）
│
├── public/                           # 静态资源（构建时原样复制到 dist/）
│   ├── hero-bg.mp4                   # 首页背景视频（Kling AI 生成，镜像显示）
│   └── images/
│       └── products/                 # 产品图片
│           ├── *.jpg / *.png         # 产品实物图
│           ├── default-吸头.svg       # 各分类默认占位图
│           └── products-optimized/   # 压缩优化版（webp）
│
├── functions/                        # Cloudflare Pages Functions（无服务器后端）
│   └── api/
│       ├── contact.js               # POST /api/contact → 发留言邮件
│       ├── register.js              # POST /api/register → 注册 + 欢迎邮件
│       ├── send-otp.js             # POST /api/send-otp → 发送登录验证码
│       └── verify-otp.js           # POST /api/verify-otp → 校验验证码
│
├── scripts/                          # 维护工具脚本（不部署到线上）
│   ├── fix-image-mappings.js        # 批量修复错误图片映射
│   ├── fix-wrong-mappings.js        # 修复错误分类映射
│   ├── scrape-gsbio-images.js       # 爬取 gsbio 产品图
│   └── batch-rename.js              # 批量重命名图片
│
├── index.html                        # HTML 入口（SEO、字体）
├── vite.config.js                    # Vite 构建配置
├── tailwind.config.js                # Tailwind 配置
├── package.json                      # 依赖与脚本命令
├── package-lock.json                 # 依赖锁定文件
├── postcss.config.js                 # PostCSS 配置
├── .gitignore                        # 忽略：node_modules/, dist/, .env
└── README.md                         # 本文档
```

---

## 6. 功能模块说明

### 6.1 主页组件结构（booster-homepage.jsx）

```
BoosterHomepage（根组件）
├── 全页背景视频（position:fixed，scaleX(-1) 镜像）
├── NavHeader（顶部导航）
│   ├── Logo + 导航菜单
│   ├── 语言切换（中 / EN）
│   ├── 未登录：登录按钮 + 注册按钮
│   └── 已登录：用户头像 + 姓名 + 退出下拉
├── HeroSection（首页大图区）
│   ├── 公司标语
│   └── 全宽搜索框（跳转产品列表）
├── CategorySection（产品分类卡片）
├── ProductCatalogSection（产品列表 + 搜索 + 分页）
├── ProductDetailView（产品详情页）
│   └── InquiryModal（询价弹窗）
├── SolutionsSection（解决方案）
├── ContactSection（联系我们 + 留言表单）
├── FooterSection（页脚）
├── LoginModal（登录弹窗）
└── RegisterModal（注册弹窗）
```

### 6.2 Liquid Glass 设计风格

所有按钮采用苹果 WWDC 2025 发布的 Liquid Glass 风格：

```js
// 主色按钮（红色玻璃）
LG.primary = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.24)...), rgba(200,16,46,0.68)",
  backdropFilter: "blur(28px) saturate(200%)",
  border: "1px solid rgba(255,255,255,0.42)",
  boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.55)...",
}

// 幽灵按钮（透明玻璃）
LG.ghost = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.26)...)",
  backdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(200,16,46,0.28)",
}
```

### 6.3 用户认证（localStorage MVP）

> **注意：当前为 MVP 方案，用户数据存储在浏览器 localStorage，无服务器数据库。**
> 后续如需多设备同步或更安全的认证，需迁移到真实数据库（如 Cloudflare D1）。

| localStorage Key | 内容 |
|-----------------|------|
| `bsd_user` | 当前登录用户对象 `{ name, email, phone, company, position }` |
| `bsd_users` | 所有已注册用户数组 |

**登录流程：**
```
用户输入邮箱 → POST /api/send-otp → 获得 token（含加密OTP）
→ 用户输入验证码 → POST /api/verify-otp（token + otp）→ 验证通过
→ 从 localStorage 查找用户资料 → 写入 bsd_user → 登录完成
```

**OTP 无数据库实现原理：**
```
token = btoa(email + ":" + otp + ":" + timestamp)
// token 返回给前端保存，验证时解码比对，无需数据库
// 10 分钟有效期由 timestamp 控制
```

### 6.4 国际区号选择器

注册弹窗电话号码栏包含：
- 左侧下拉：70+ 国家区号（含旗帜 emoji）
- 右侧输入：电话号码（≥5位即可，适配国际号码）
- 支持"自定义"选项手动输入区号

---

## 7. 数据文件说明

### `src/data/all-products.json` — 产品数据库

包含所有产品完整信息（528 KB，1961 条），每条结构如下：

```json
{
  "cat": "实验耗材",
  "sub": "吸头",
  "sku": "BSD-HC-TIP-10UL-001",
  "name": "0.1-10μL 普通吸头（透明，PP，散装，32°锥度）",
  "spec": "1000支/包",
  "price": 986,
  "brand": "Booster"
}
```

### `src/data/product-image-map.json` — 图片映射表

SKU 与图片路径的映射（1.2 MB，4735 条）：

```json
{
  "BSD-HC-TIP-10UL-001": {
    "image": "移液处理_10uL加长普通吸头_102.jpg",
    "matchType": "keyword",
    "category": "吸头",
    "description": "10uL加长普通吸头"
  }
}
```

**`matchType` 优先级（高→低）：**

| matchType | 说明 | 可否覆盖 |
|-----------|------|---------|
| `exact` | 人工精确指定 | ❌ 不可覆盖 |
| `keyword` | 关键词自动匹配 | ❌ 不可覆盖 |
| `gsbio-crawl` | 爬虫抓取图片 | 可被 exact/keyword 覆盖 |
| `category-fixed` | 分类修正图片 | 可覆盖 |
| `category` | 分类通用图片 | 可覆盖 |
| `generic` | 通用占位图 | 可覆盖 |

### `src/data/imageLoader.js` — 图片加载模块

```javascript
getProductImage(sku, category, type)  // type: 'main' | 'compressed' | 'thumb'
hasRealImage(sku)                      // 是否有真实产品图（非默认占位）
getImageInfo(sku)                      // 获取匹配详情（用于调试）
```

---

## 8. 环境变量配置

### 线上（Cloudflare Pages 控制台配置）

| 变量名 | 说明 | 配置位置 |
|--------|------|---------|
| `RESEND_API_KEY` | Resend 邮件服务 API 密钥 | Cloudflare Dashboard → Pages → booster-website → 设置 → 变量和机密 |

### 本地开发

Cloudflare Functions 在本地不运行，无需配置 `.env`。
所有 API 调用在本地会自动降级（见第 3 节本地预览模式说明）。

---

## 9. Cloudflare Functions API

### POST `/api/contact` — 提交留言

```json
// 请求
{ "name": "张三", "email": "test@example.com", "company": "某某公司", "message": "留言内容" }

// 成功响应
{ "success": true }
```

### POST `/api/register` — 用户注册

```json
// 请求（name/email/phone/company 必填，position 选填）
{ "name": "张三", "email": "test@example.com", "phone": "+86 13800138000", "company": "某某公司", "position": "研究员" }

// 成功响应
{ "success": true, "user": { "name": "张三", "email": "...", ... } }
```
> 同时发送：欢迎邮件到用户邮箱 + 管理员通知到 service@tflabservice.com

### POST `/api/send-otp` — 发送登录验证码

```json
// 请求
{ "contact": "test@example.com", "type": "email" }

// 成功响应（token 用于后续验证，10分钟有效）
{ "success": true, "token": "base64编码的token" }
```

### POST `/api/verify-otp` — 校验验证码

```json
// 请求
{ "token": "...", "otp": "123456" }

// 成功响应
{ "success": true, "email": "test@example.com" }

// 失败响应示例
{ "error": "验证码已过期，请重新获取" }
```

---

## 10. 常见问题 & 故障排查

### ❌ 网站打开空白页

**按以下顺序排查：**

**第一步：F12 控制台查错误**
```
常见错误类型：
├── "React is not defined"
│     → 组件用了 React.useState 但文件顶部没有 import React
│     → 修复：把 React.useState 改为 useState（已在顶部 import）
│
├── "Cannot read properties of undefined"
│     → 某个数据还未加载就被访问（如读取 null.xxx）
│     → 修复：加 ?. 可选链操作符，或检查数据加载逻辑
│
└── "Unexpected token / SyntaxError"
      → JSX 语法错误（如标签未关闭、括号不匹配）
      → 修复：检查报错行周围的 JSX 代码
```

**第二步：检查 bundle 大小**
```
打开 F12 → Network 标签 → 刷新页面 → 找到 .js 文件
✅ 正常大小：约 1-2 MB
❌ 异常：超过 4 MB → 可能将大型数据直接写在 .jsx 里
   修复：将大型数据提取到独立 JSON 文件，用 import 引入
```

**第三步：检查 import 语句位置**
```javascript
// ❌ 错误：import 写在 const 声明之后
const T = { color: 'red' };
import data from './data.json';  // 语法错误！

// ✅ 正确：所有 import 必须在文件最顶部
import data from './data.json';
const T = { color: 'red' };
```

### ❌ 构建失败（`npm run build` 报错）

```
1. 仔细阅读红色错误信息，找到文件名和行号
2. 常见原因：
   ├── JSX 标签未关闭
   ├── import 了不存在的文件路径
   └── JSON 文件格式不合法（多了逗号等）
3. 修复后重新运行 npm run build，直到无 ERROR
```

### ❌ 产品图片不显示

```
1. 确认图片文件在 public/images/products/ 目录下
2. 检查 product-image-map.json 中对应 SKU 的 image 字段
3. 文件名区分大小写，必须完全一致
4. 本地 npm run dev 确认显示正常后再推送
```

### ❌ 登录/注册功能失效（线上）

```
1. 确认 RESEND_API_KEY 在 Cloudflare 环境变量中已配置
2. Cloudflare Dashboard → Pages → booster-website
   → Functions → 查看日志是否有报错
3. 检查 functions/api/ 下对应文件代码
```

### ❌ 背景视频不播放

```
1. 确认 public/hero-bg.mp4 文件存在
2. 浏览器兼容性：Chrome/Edge/Safari 支持 MP4，Firefox 可能需要 WebM 格式
3. 视频自动播放需 muted 属性（已设置），部分浏览器策略可能仍阻止
```

---

## 11. 产品数据维护

### 添加新产品

编辑 `src/data/all-products.json`，在数组末尾追加：

```json
{
  "cat": "实验耗材",
  "sub": "吸头",
  "sku": "BSD-HC-TIP-XXX-001",
  "name": "产品名称",
  "spec": "规格说明",
  "price": 1000,
  "brand": "Booster"
}
```

### 为产品指定图片

编辑 `src/data/product-image-map.json`：

```json
{
  "BSD-HC-TIP-XXX-001": {
    "image": "图片文件名.jpg",
    "matchType": "exact",
    "category": "吸头",
    "description": "图片描述"
  }
}
```

图片文件需放在 `public/images/products/` 目录下。

### 修复批量图片映射

```bash
node scripts/fix-image-mappings.js
node scripts/fix-wrong-mappings.js
```

---

## 12. 部署信息汇总

| 项目 | 信息 |
|------|------|
| 线上网址 | https://tflabservice.com |
| GitHub 仓库 | https://github.com/Benny20260131/booster-website |
| Cloudflare 账号 | Ssccben@gmail.com |
| Cloudflare Pages 项目 | booster-website |
| 生产分支 | main |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| 邮件服务 | Resend API（RESEND_API_KEY 已配置） |
| 发件地址 | service@tflabservice.com |
| 管理员收件地址 | service@tflabservice.com |

### 自动部署流程

```
本地修改代码
    ↓ 完成本地 6 步验证
git add <文件名>
git commit -m "修改说明"
    ↓
git push origin main
    ↓
GitHub 通知 Cloudflare（Webhook 自动触发）
    ↓
Cloudflare 拉取代码并执行 npm run build（约 1-3 分钟）
    ↓
新版本自动上线 https://tflabservice.com
```

---

## 13. 版本历史

| 提交 | 时间 | 内容 |
|------|------|------|
| 0d6fc8e | 2026-03 | 全站升级：登录/注册/询价/Liquid Glass/国际区号/i18n修复 |
| a11cc86 | 2026-03 | feat: add login/register modals with OTP auth and full i18n |
| 24bcee4 | 2026-03 | feat: add hero background video with mirror effect |
| c3c8117 | 2026-03 | fix: 留言邮件发送地址改为 service@tflabservice.com |
| e188811 | 2026-03 | test: 临时改收件人为gmail测试Resend是否通 |
| a1a333b | 2026-03 | feat: 添加早期2试剂盒产品图片（13个SKU） |
| 85eeb3d | 2026-03 | fix: 修复 292 条错误分类图片映射 |
| 50722ce | 2026-03 | feat: 添加留言表单自动发邮件（Resend API + CF Function） |
| 1c527ca | 2026-03 | feat: 更新公司名称为上海博仕达生物工程有限公司 |
| f98872a | 2026-03 | feat: 初始提交 |

---

*文档最后更新：2026年3月 | 上海博仕达生物工程有限公司*
