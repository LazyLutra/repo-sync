# RepoSync

RepoSync 是一款基于 **Electron + Vue 3 + TypeScript** 构建的强大且轻量的跨平台 Git 仓库批量管理工具。
它专门为了解决开发人员在微服务或多模块架构下，面对大量零散代码仓库时产生的同步难、状态管理乱、批处理繁杂等痛点而设计。
项目仅在本地运行，不依赖于任何远程服务器。

## 🌟 核心特性

- **📂 可视化动态扫描**：配置根目录后，可以一键快速递归扫描名下潜藏的全部有效 Git 仓库（支持忽略 `.antigravityignore` 等自定义过滤）。
- **📊 仓库状态总览**：实时洞察所有被托管仓库的状态，如：当前分支、落后/领先提交数、是否有未提交的更改等。
- **🚀 编排与批量执行 (Workflow)**：
  - 自由拖拽和拼装 Git 基础命令（如 `Pull`, `Push`, `Checkout`, `Merge`, `Fetch`）甚至自定义 Shell(`Custom Cmd`)。
  - 创建属于自己的 Workflow 流水线，并对已选中的 N 个仓库进行一键无差别并发执行。
- **📝 分层日志追踪**：日志系统支持按具体的 Repository 分组追踪，通过标准的终端态样式呈现每一条执行命令 `$ git pull`，配套以醒目的状态栏点以及原始报错输出日志。
- **🎨 现代化 UI**：全面接入 `ant-design-vue` 体系进行重构改版，风格现代素雅且空间利用率极高。

## 🛠️ 技术栈

- **Core**: [Electron](https://www.electronjs.org/)
- **Frontend**: [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) + [Ant Design Vue](https://antdv.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Git Interaction**: [simple-git](https://github.com/steveukx/git-js)
- **Build Tool**: [electron-builder](https://www.electron.build/)

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装 [Node.js](https://nodejs.org/) (推荐 LTS 版本) 以及 Git 运行环境。

### 2. 获取代码与安装依赖

```bash
# 进入项目目录
cd repo-sync

# 安装依赖
npm install
```

> **注意**：如果您在中国大陆地区，为了加速 Electron 二进制文件的下载，强烈建议配置国内镜像：
>
> ```bash
> npm config set electron_mirror https://npmmirror.com/mirrors/electron/
> npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
> ```

### 3. 启动开发服务器

```bash
npm run dev
```

此命令将同时启动 Vite 开发服务器和 Electron 应用窗口。开启后，可以按下 `F12` 键唤起控制台面板。

## 📖 操作指南

RepoSync 的核心操作流程如下：

1. **导入仓库**：通过左侧栏上方添加目标工作区（通常为人个项目大纲或代码总目录），系统会自动深度扫描并提取全量包含了 `.git` 的有效微服务或仓库列表。
2. **勾选目标环境**：在主界面的仓库收纳列里，勾选本次需要同步管理的仓库实体。
3. **配置流水线 (Workflow)**：
   - 点击最右侧快捷工具行旁的 `Action` （如 `Git Pull` 或 `Git Checkout`）来触发下拉，从中选择 `Configure Workflow...`。
   - 在弹出的配置版中 `Add Step`，组合所需的一系列 Git 基础操作（拉取、切换、合并、推送等）。部分命令支持快捷选择本地分支（如 `merge` 选择来源与去向）。
4. **一键并发执行**：全部就绪后，点击蓝色的 `Run Batch`。选中的 N 个仓库会实时并在面板下方的 `Execution Logs` 日志面板中按照项目分类折叠展示它的具体命令执行明细以及报错信息。

## 📦 打包与构建

本项目使用 `electron-builder` 进行打包。

### 常用命令

| 命令                | 说明                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `npm run build`     | **完整打包**：执行类型检查、构建前端与主进程，并生成安装包（如 Windows 的 .exe 等）           |
| `npm run build:win` | **Windows 打包**：仅构建 Windows x64 平台的安装包                                             |
| `npm run build:dir` | **快速测试**：仅输出未打包的可执行程序目录（位于 `release/x.x.x/win-unpacked`），不生成安装包 |
| `npm run clean`     | **清理构建产物**：删除 `dist`, `dist-electron`, `release` 等历史执行遗留目录                  |

## 📂 项目目录结构

```text
repo-sync/
├── build/                  # 构建资源目录（如应用图标 icons/）
├── shared/                 # 前后端共享代码（类型定义、常量封装如 IPC channel）
├── src/
│   ├── main/               # Electron 主进程源码
│   │   ├── services/       # 主进程能力层（File Scanner, Git Runner, IPC Registry, Store）
│   │   └── index.ts        # 主进程入口文件
│   ├── renderer/           # Vue 3 渲染进程源码
│   │   ├── components/     # Vue 业务与基础组件库
│   │   ├── store/          # Pinia 状态管理矩阵
│   │   ├── App.vue         # 根组件
│   │   └── main.ts         # 渲染进程入口
├── electron-builder.json5  # 打包与发布规则参数配置
├── vite.config.ts          # Vite 配置（包含 Electron 核心插件组合）
├── package.json            # 项目依赖与脚本配置
└── tsconfig.json           # TypeScript 配置
```

## 📄 开源协议

本项目基于 [MIT License](./LICENSE) 协议开源，欢迎您一起参与构建与二次分发。
