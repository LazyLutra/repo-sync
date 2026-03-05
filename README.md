# RepoSync

<p align="center">
  <strong>跨平台 Git 仓库批量管理 & 本地环境服务管理工具</strong>
</p>

RepoSync 是一款基于 **Electron + Vue 3 + TypeScript** 构建的跨平台桌面应用，面向微服务 / 多仓库开发者。它聚焦于两大核心场景：

1. **Git 仓库批量管理** — 扫描、查看状态、编排 Workflow 并发执行
2. **本地环境服务管理** — 一键识别并启动 Nacos / Redis / Nginx 等服务，实时查看输出日志

项目完全本地运行，无需依赖任何远程服务器。

---

## 🌟 核心特性

### Git 仓库管理

- **📂 动态扫描**：配置根目录后一键递归扫描全部有效 Git 仓库
- **📊 状态总览**：实时查看每个仓库的当前分支、落后/领先提交数、未提交变更等状态
- **🚀 Workflow 编排与批量执行**：
  - 自由拖拽组合 Git 命令（`Pull`、`Push`、`Checkout`、`Merge`、`Fetch`、`Custom Cmd`）
  - 创建 Workflow 流水线，对选中的多个仓库并发执行
- **📝 分层日志追踪**：按仓库分组展示执行命令及输出，支持状态标识与错误高亮

### 本地环境服务管理

- **➕ 智能识别**：选择文件夹后自动分析目录内容，识别服务类型（Nacos / Redis / Nginx）
- **⚙️ 启动命令配置**：为每个服务自定义启动命令（如 `bin\startup.cmd -m standalone`）
- **📄 配置文件编辑**：直接在应用中查看和编辑服务的配置文件（如 Nacos 的 `conf/application.properties`）
- **📺 实时日志输出**：服务启动后，`stdout` / `stderr` 输出实时显示在 Service Logs 面板中
- **🛑 一键启停**：支持启动和停止服务进程，进程退出时自动更新状态

---

## 🛠️ 技术栈

| 层级     | 技术                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 框架     | [Electron](https://www.electronjs.org/)                                                                   |
| 前端     | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) |
| UI 组件  | [Ant Design Vue](https://antdv.com/) + [Lucide Icons](https://lucide.dev/)                                |
| 状态管理 | [Pinia](https://pinia.vuejs.org/)                                                                         |
| Git 交互 | [simple-git](https://github.com/steveukx/git-js)                                                          |
| 打包构建 | [electron-builder](https://www.electron.build/)                                                           |

---

## 🚀 快速开始

### 环境准备

确保已安装 [Node.js](https://nodejs.org/)（推荐 LTS 版本）和 Git。

### 安装与运行

```bash
# 进入项目目录
cd repo-sync

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

> **国内镜像加速**（可选）：
>
> ```bash
> npm config set electron_mirror https://npmmirror.com/mirrors/electron/
> npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
> ```

启动后可按 `F12` 打开开发者工具。

---

## 📖 操作指南

### Git 仓库管理

1. 通过左侧栏添加工作区目录，系统自动扫描子目录中包含 `.git` 的仓库
2. 在仓库列表中勾选目标仓库
3. 在 Workflow 面板中 `Add Step` 组合 Git 操作
4. 点击 `Run Batch` 并发执行，日志面板实时展示执行结果

### 本地环境服务管理

1. 切换到 Activity Bar 的"环境服务"视图
2. 点击 **"+"** 卡片选择服务所在文件夹（自动识别 Nacos / Redis / Nginx）
3. 通过 **Terminal 按钮** 查看或修改启动命令
4. 通过 **Settings 按钮** 查看或编辑配置文件
5. 点击 **Start Service** 启动服务，实时日志输出到下方 Service Logs 面板

---

## 📦 打包与构建

| 命令                | 说明                                               |
| ------------------- | -------------------------------------------------- |
| `npm run build`     | 完整打包：类型检查 + 构建 + 生成安装包             |
| `npm run build:win` | 仅构建 Windows x64 平台安装包                      |
| `npm run build:dir` | 快速测试：输出未打包的可执行程序目录               |
| `npm run clean`     | 清理 `dist`、`dist-electron`、`release` 等构建产物 |

---

## 📂 项目目录结构

```text
repo-sync/
├── build/                          # 构建资源（应用图标等）
├── public/                         # 静态资源
├── src/
│   ├── ipc/                        # IPC 通道定义（主进程与渲染进程共享）
│   │   └── channel.ts              # 通道名称常量
│   │
│   ├── main/                       # Electron 主进程
│   │   ├── services/
│   │   │   ├── ipc-main.ts         # IPC Handler 注册中心
│   │   │   ├── scanner.ts          # Git 仓库扫描器
│   │   │   ├── git-runner.ts       # Git 命令执行器
│   │   │   ├── git-service.ts      # Git 服务封装
│   │   │   ├── batch-executor.ts   # 批量执行器
│   │   │   ├── env-scanner.ts      # 环境服务目录识别 & 配置文件读写
│   │   │   ├── env-process-manager.ts  # 环境服务子进程管理（spawn/kill/日志推送）
│   │   │   ├── store.ts            # 应用配置持久化
│   │   │   └── window-manager.ts   # 窗口管理
│   │   └── index.ts                # 主进程入口
│   │
│   ├── preload/                    # Preload 脚本（安全暴露 API 给渲染进程）
│   │   └── index.ts
│   │
│   └── renderer/                   # Vue 3 渲染进程
│       ├── components/
│       │   ├── layout/             # 布局组件
│       │   │   ├── ActivityBar.vue      # 全局导航栏
│       │   │   ├── MainLayout.vue       # 主布局容器
│       │   │   └── Sidebar.vue          # 侧边栏（仓库列表）
│       │   └── business/           # 业务组件
│       │       ├── EnvironmentView.vue  # 环境服务管理界面
│       │       ├── RepoList.vue         # 仓库列表
│       │       ├── RepoItem.vue         # 单个仓库项
│       │       ├── WorkflowSection.vue  # Workflow 操作区
│       │       ├── WorkflowEditor.vue   # Workflow 编辑器
│       │       └── LogPanel.vue         # 执行日志面板
│       ├── store/                  # Pinia 状态管理
│       ├── styles/                 # 全局样式
│       ├── views/                  # 页面视图
│       ├── App.vue                 # 根组件
│       └── main.ts                 # 渲染进程入口
│
├── electron-builder.json5          # electron-builder 打包配置
├── vite.config.ts                  # Vite 配置
├── package.json                    # 项目依赖与脚本
└── tsconfig.json                   # TypeScript 配置
```

---

## 📄 开源协议

本项目基于 [GPL-3.0 License](./LICENSE) 协议开源。
