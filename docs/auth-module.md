# 用户认证模块设计说明（React + REST 重构版）

## 1. 目标与范围

- 提供注册、登录、找回密码、重置密码的 API，并允许任意前端（React、移动端等）调用。
- 保证凭证安全：密码使用 BCrypt 哈希存储；找回密码通过一次性 token 验证。
- 提供 React 前端示例，演示如何消费这些 REST 接口。

## 2. 系统架构

```
React UI (Vite)  <--REST-->  Spring Boot API  -->  Service  -->  Repository(JPA)  -->  MySQL
                                                 |             |
                                             Spring Security   |
```

- **React (Vite)**：提供登录、注册、找回、重置、仪表盘页面。
- **Spring Boot REST API**：暴露 `/api/auth/**`、`/api/users/**` 接口。
- **Spring Security**：禁用表单登录，提供 CORS 与 `PasswordEncoder` 支持，后续可接入 JWT/Session。
- **Spring Data JPA**：管理实体与 MySQL 数据库交互。

## 3. 数据模型

`users` 表字段保持不变（见 `src/main/java/com/itheima/demo3/entity/User.java`）：

- `username`、`email` 唯一约束。
- `password` 使用 BCrypt。
- `reset_token` + `reset_token_expiry` 记录找回密码信息。
- `created_at`、`updated_at` 在 `@PrePersist/@PreUpdate` 中自动维护。

## 4. 后端关键组件

### Repository
- `UserRepository`：按用户名、邮箱、token 检索用户。

### Service 层
- `UserService` + `UserServiceImpl`：
  - `registerUser`：验证注册表单、加密密码。
  - `authenticate`：支持用户名或邮箱 + 密码校验。
  - `initiatePasswordReset`：生成 30 分钟有效的 token。
  - `resetPassword`：校验 token、更新密码、清空 token。

### 控制器
- `AuthController` (`/api/auth`):
  - `POST /register`：注册账号。
  - `POST /login`：登录，返回用户信息（未实现 JWT，可在前端本地持久化）。
  - `POST /forgot-password`：发送重置链接（演示环境日志输出）。
  - `GET /reset-password/validate`：校验 token 是否有效。
  - `POST /reset-password`：提交 token + 新密码。
- `UserController` (`/api/users/{identifier}`)：根据用户名或邮箱返回公开资料。
- `GlobalExceptionHandler`：统一 JSON 返回格式，处理校验异常和业务异常。

### 安全配置
- `SecurityConfig`：
  - `csrf` 关闭，`session` 设置为 `STATELESS`。
  - 允许跨域（默认放行 `http://localhost:3000`）。
  - 目前所有 API 均 `permitAll`，便于前端联调；可按需增加鉴权。
  - 暴露 `BCryptPasswordEncoder` 供服务层使用。

## 5. REST API 返回模型

- `LoginResponse`：`message` + `user`（`UserResponse`）。
- `ApiMessage`：统一的 `{ message: "..." }`。
- 校验失败：返回 `400` + `{ message: "...", errors: { field: reason } }`。

## 6. React 前端概览

项目位于 `frontend/`，基于 Vite + React + React Router + Axios。

- `src/state/AuthContext.jsx`：管理登录状态，持久化到 `localStorage`。
- `src/services/api.js`：封装 Axios 客户端与 `authApi`/`userApi` 方法；默认指向 `http://localhost:8081/api`。
- 页面：
  - `LoginPage`：输入用户名/邮箱 + 密码，调用 `/auth/login`。
  - `RegisterPage`：注册账号，展示字段错误。
  - `ForgotPasswordPage`：触发 `/auth/forgot-password`。
  - `ResetPasswordPage`：读取 URL 中 token，调用校验与重置接口。
  - `DashboardPage`：展示登录后的用户信息，支持退出。
- `ProtectedRoute`：路由级登录拦截。
- 样式：`src/styles.css`。

## 7. 典型流程

1. **注册**
   - React 调用 `POST /api/auth/register`，成功后提示用户登录。
2. **登录**
   - React 调用 `POST /api/auth/login`，在上下文中缓存返回的用户信息。
3. **找回密码**
   - 前端提交邮箱到 `POST /api/auth/forgot-password`，后端生成 token（日志输出重置链接）。
4. **验证重置链接**
   - 前端在加载重置页时调用 `GET /api/auth/reset-password/validate?token=...`。
5. **重置密码**
   - 前端提交 `{ token, password, confirmPassword }` 至 `POST /api/auth/reset-password`，后端完成校验与更新。

## 8. 环境配置与启动

```bash
# 后端（端口 8081）
./mvnw spring-boot:run

# 前端（端口 3000）
cd frontend
cp .env.example .env            # 如需自定义 API 地址
npm install
npm run dev
```

在开发模式下，访问 `http://localhost:3000`，React 应用将通过 Axios 调用上述 REST API。

## 9. 后续扩展建议

1. 引入 JWT 或 Session + Spring Security 配置，保护 `/api/users/**` 等受限资源。
2. 将重置链接通过邮件发送，并将日志输出替换为实际通知服务。
3. 在前端加入表单验证库（例如 Zod/Formik），提升用户体验。
4. 编写集成测试（Spring MockMvc、React Testing Library）保障主要流程。
