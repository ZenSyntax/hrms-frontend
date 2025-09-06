# HRMS 人力资源管理系统

基于 Vue 3 + TypeScript + Element Plus + ECharts 构建的现代化人力资源管理系统。

## 功能特性

### 核心功能
- **员工管理**: 员工信息的增删改查、批量操作、Excel导出
- **岗位管理**: 岗位信息管理、薪资设置、岗位要求配置
- **部门管理**: 部门层级管理、主管设置、部门统计
- **培训管理**: 培训课程管理、学员管理、培训效果统计
- **薪资管理**: 薪资条管理、薪资计算、薪资统计
- **系统管理**: 用户管理、系统日志、收支管理

### 数据统计
- **总览统计**: 关键指标展示、趋势分析
- **员工统计**: 员工类型分布、学历分布、性别分布、年龄分布、入职离职趋势
- **薪资统计**: 薪资分布、平均薪资趋势、部门薪资对比、岗位薪资对比
- **部门统计**: 部门人员分布、部门薪资统计、部门绩效统计、部门人员流动统计

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **图表库**: ECharts
- **HTTP客户端**: Axios
- **构建工具**: Vite

## 项目结构

```
src/
├── api/                 # API接口
│   ├── index.ts        # 基础API配置
│   └── statistics.ts   # 统计相关API
├── components/         # 公共组件
├── layouts/           # 布局组件
│   └── MainLayout.vue # 主布局
├── router/            # 路由配置
│   └── index.ts
├── stores/            # 状态管理
│   └── index.ts
├── types/             # 类型定义
│   ├── index.ts      # 基础类型
│   └── statistics.ts # 统计相关类型
└── views/            # 页面组件
    ├── DashboardView.vue           # 仪表盘
    ├── LoginView.vue              # 登录页
    ├── employee/                  # 员工管理
    ├── job/                       # 岗位管理
    ├── department/                # 部门管理
    ├── training/                  # 培训管理
    ├── salary/                    # 薪资管理
    ├── system/                    # 系统管理
    └── statistics/                # 数据统计
```

## 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## API接口

### 基础接口
系统使用现有的HRMS后端API，包括：
- 员工管理接口 (`/worker/*`)
- 岗位管理接口 (`/job/*`)
- 部门管理接口 (`/department/*`)
- 培训管理接口 (`/lesson/*`, `/number/*`)
- 薪资管理接口 (`/salary/*`)
- 系统管理接口 (`/user/*`, `/log/*`, `/payment/*`)

### 统计接口
新增的统计相关接口：
- `GET /statistics/overview` - 获取总览统计
- `GET /statistics/employee` - 获取员工统计
- `GET /statistics/salary` - 获取薪资统计
- `GET /statistics/department` - 获取部门统计
- `GET /statistics/training` - 获取培训统计
- `GET /statistics/system` - 获取系统统计
- `GET /statistics/payment` - 获取收支统计

详细的API文档请参考 `HRMS-Statistics-API.md`。

## 数据模型

### 基础数据模型
- `Worker` - 员工信息
- `Job` - 岗位信息
- `Department` - 部门信息
- `Lesson` - 培训课程
- `Salary` - 薪资信息
- `User` - 用户信息
- `Log` - 系统日志
- `Payment` - 收支信息

### 统计VO对象
- `StatisticsOverviewVO` - 总览统计
- `EmployeeStatisticsVO` - 员工统计
- `SalaryStatisticsVO` - 薪资统计
- `DepartmentStatisticsVO` - 部门统计
- `TrainingStatisticsVO` - 培训统计
- `SystemStatisticsVO` - 系统统计
- `PaymentStatisticsVO` - 收支统计

## 配置说明

### 环境配置
在 `src/api/index.ts` 中配置后端API地址：
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080', // 根据实际后端地址调整
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 主题配置
系统使用Element Plus默认主题，主色调为蓝色系 (`#409eff`)，与HRMS品牌色保持一致。

## 开发指南

### 添加新页面
1. 在 `src/views/` 下创建对应的Vue组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在 `src/layouts/MainLayout.vue` 中添加菜单项

### 添加新API
1. 在 `src/api/` 下创建对应的API文件
2. 在 `src/types/` 下定义相关的类型
3. 在组件中使用API

### 添加新图表
1. 在页面组件中引入ECharts
2. 创建图表容器元素
3. 配置图表选项并初始化

## 部署说明

### 构建部署
```bash
npm run build
```
构建完成后，将 `dist` 目录下的文件部署到Web服务器。

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://your-backend-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 注意事项

1. **数据安全**: 请确保在生产环境中使用HTTPS
2. **权限控制**: 建议在后端实现完整的权限验证
3. **数据备份**: 定期备份数据库数据
4. **性能优化**: 大量数据时建议使用分页和虚拟滚动
5. **浏览器兼容**: 建议使用现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）

## 许可证

本项目仅供学习和研究使用。

## 联系方式

如有问题或建议，请联系开发团队。