# Create Tauri App

# tauri.conf.json

```json5
{
  // 指向 Tauri 配置的 JSON schema 文件，用于编辑器智能提示
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  // 应用程序的显示名称
  "productName": "demo-tauri",
  // 应用程序版本号
  "version": "0.1.0",
  // 应用程序的唯一标识符，用于系统级标识
  "identifier": "com.tauri.dev",
  // 构建相关配置
  "build": {
    // 前端构建输出目录
    "frontendDist": "../build",
    // 开发服务器 URL
    "devUrl": "http://localhost:1420",
    // 开发服务器启动前执行的命令，留空表示不执行任何命令
    "beforeDevCommand": "",
    // 构建前执行的命令
    "beforeBuildCommand": "pnpm build"
  },
  // 应用程序配置
  "app": {
    // 窗口配置
    "windows": [
      {
        // 窗口标题
        "title": "demo-tauri",
        // 窗口宽度
        "width": 1200,
        // 窗口高度
        "height": 800,
        // 是否可调整窗口大小
        "resizable": true,
        // 是否全屏启动
        "fullscreen": false,
        // 是否启用开发者工具
        "devtools": true
      }
    ],
    // 安全配置
    "security": {
      // 内容安全策略，null 表示禁用 CSP
      "csp": null
    }
  },
  // 应用程序打包配置
  "bundle": {
    // 是否启用打包
    "active": true,
    // 目标平台，'all' 表示所有支持的平台
    "targets": "all",
    // 应用程序图标配置
    "icon": [
      // 32x32 像素图标
      "icons/32x32.png",
      // 128x128 像素图标
      "icons/128x128.png",
      // 高分辨率 128x128 像素图标 (2x)
      "icons/128x128@2x.png",
      // macOS 图标文件
      "icons/icon.icns",
      // Windows 图标文件
      "icons/icon.ico"
    ]
  }
}
```
