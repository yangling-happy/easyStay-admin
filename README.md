# EasyStay 酒店管理后台

## 项目简介
易宿酒店管理后台，一个基于现代前端技术的酒店业务管理系统。

## 快速启动
1. 克隆项目
```
git clone https://github.com/yangling-happy/easyStay-admin.git
```
2. 安装依赖
```
pnpm install
```
3. 启动开发服务器
```
pnpm dev
```

## 后端服务 (Node.js + MongoDB)

本项目采用 Node.js (ES Modules) + MongoDB 构建，为 EasyStay 管理系统提供 API 支持。

### 1. 环境准备
- **Node.js**: 建议 v18.0.0 或更高版本
- **MongoDB**: 本地社区版 (默认端口 27017)
- **包管理器**: pnpm (推荐) 或 npm

### 2. 快速开始
在 `server` 目录下执行：
```bash
pnpm install
```

### 第二步：配置环境变量
复制根目录的 `.env.example` 并重命名为 `.env`：
```bash
cp .env.example .env
```
确认其中的 `MONGODB_URI` 为：`mongodb://127.0.0.1:27017/easyStay`

### 第三步：启动服务

```bash
pnpm dev
```

## 3. 验证部署
启动后，终端若显示 `✅ MongoDB Connected`，请访问：
[http://localhost:3000/health](https://www.google.com/search?q=http://localhost:3000/health)

如果看到 `{"status":"ok"}`，说明后端已成功启动。

## 架构设计
本项目采用 B 端分层架构，实现 UI 表现层与业务数据层的深度解耦：

### 目录结构说明
- **layouts/**: 全局布局组件，包含侧边栏导航、顶部工具栏及响应式布局容器
- **pages/**: 按业务模块划分的页面组件
  - HotelList: 负责酒店数据展示与状态操作
  - HotelEdit: 负责复杂表单交互逻辑
  - HotelAudit: 负责酒店信息审核/发布/下线功能
- **api/**: 服务层抽象，统一封装对存储引擎的 CRUD 操作，屏蔽底层持久化细节
- **store/**: 集中式状态管理，处理跨页面数据联动（如“数据录入后列表实时同步”）
- **types/**: 统一的业务实体类型定义，作为全链路的数据契约
