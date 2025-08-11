# Tauri v2 + Web 桌面端实战指南（增强版）

---

## 一、Tauri v2 简介（1–2 分钟）

* **Tauri v2** 是目前最新稳定版本，具备更强的跨平台能力、安全性和移动支持。
* 采用 WebView 加 Rust 后端架构，体积轻、性能优 ([v2.tauri.app](https://v2.tauri.app/learn/window-customization/?utm_source=chatgpt.com))。

---

## 二、系统目录实战：获取与使用

Tauri v2 提供丰富的路径获取方法，适用于配置、缓存、日志等。

### 常用路径 API

通过 `@tauri-apps/api/path` 提供的重要函数包括：

* `appConfigDir()` → 应用配置目录（如 macOS: `~/Library/Application Support/<bundleIdentifier>`）
* `appCacheDir()`, `appDataDir()`, `appLogDir()` 等，方便管理缓存或日志资源。([Tauri][1], [Michael Charles Aubrey][2])

### 使用示例：读取配置 + 写日志

```js
import { appConfigDir, appLogDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

async function loadSettings() {
  const cfgDir = await appConfigDir();
  console.log('配置路径:', cfgDir);
  try {
    const content = await readTextFile('settings.json', { baseDir: BaseDirectory.AppConfig });
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeLog(msg) {
  const logDir = await appLogDir();
  await writeTextFile('app.log', msg + '\n', { baseDir: BaseDirectory.AppLog, append: true });
}
```

这些 API 结合 `plugin-fs` 使用更安全、跨平台还支持路径作用域控制([Tauri][3])。

---

## 三、后端能力如何安全暴露给前端（IPC / Commands）

### Rust 后端示例

```rust
#[tauri::command]
fn add(a: i32, b: i32) -> i32 {
  a + b
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![add])
    .run(tauri::generate_context!())
    .expect("error launching app");
}
```

### 前端调用示例

```js
import { invoke } from '@tauri-apps/api/tauri';
(async () => {
  const sum = await invoke('add', { a: 3, b: 5 });
  console.log('Sum:', sum);
})();
```

这种模式安全隔离后端逻辑（文件、系统权限访问），减少风险暴露。

---

## 四、定制窗口头部（Custom Titlebar）与配色

Tauri 提供内置手段实现自定义窗口标题栏，同时兼容拖动、控制按钮等功能。

### 配置步骤

1. `tauri.conf.json` 设置：

   ```json
   "tauri": {
     "windows": [{ "decorations": false }],
     "allowlist": { "window": { "all": true } }
   }
   ```

   同时需开启 drag 区域权限([Tauri][4])

2. 前端 HTML + CSS + JS：

```html
<body>
  <div data-tauri-drag-region class="titlebar">
    <button id="min">▁</button>
    <button id="max">◻</button>
    <button id="close">×</button>
  </div>
</body>
```

```css
.titlebar {
  height: 30px;
  background: #004080; /* 自定义主题色 */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: fixed;
  width: 100%;
  user-select: none;
}
.titlebar button:hover { background: #0059b3; }
```

```js
import { appWindow } from '@tauri-apps/api/window';
document.getElementById('min').onclick = () => appWindow.minimize();
document.getElementById('max').onclick = () => appWindow.toggleMaximize();
document.getElementById('close').onclick = () => appWindow.close();
```

多篇教程与示例亦推荐此结构([Tauri][4], [DEV Community][5], [jonaskruckenberg.github.io][6])。

---

## 五、完整分享结构建议（20 分钟目标 + 深度示范）

| 时间   | 内容                          |
| ---- | --------------------------- |
| 2 分钟 | Tauri v2 核心理念与优势            |
| 6 分钟 | 系统路径管理实战：读取配置 + 写日志         |
| 6 分钟 | 后端命令机制：Rust → 前端调用演示        |
| 6 分钟 | 自定义窗口头部：配置 + HTML/CSS/JS 实战 |
| 2 分钟 | 总结 + 拓展方向（权限控制、打包、插件等）      |

---

如果你希望加一个小 Demo，比如展示路径实际返回值（如 macOS 上 `appConfigDir()` 输出的路径），或是进一步讲 unpackaging、更新机制等，随时告诉我，我可以继续帮你丰富内容！

[1]: https://v2.tauri.app/reference/javascript/api/namespacepath/?utm_source=chatgpt.com "path - Tauri"
[2]: https://michaelcharl.es/aubrey/en/code/tauri-2-mac-paths?utm_source=chatgpt.com "Mapping Tauri Path Helper Functions on macOS | MichaelCharl.es ..."
[3]: https://v2.tauri.app/plugin/file-system/?utm_source=chatgpt.com "File System - Tauri"
[4]: https://v2.tauri.app/learn/window-customization/?utm_source=chatgpt.com "Window Customization - Tauri"
[5]: https://dev.to/waradu/beautiful-custom-titlebar-in-nuxt-with-tauri-with-controls-la1?utm_source=chatgpt.com "Custom titlebar in Nuxt with Tauri with controls - DEV Community"
[6]: https://jonaskruckenberg.github.io/tauri-docs-wip/examples/window-customization.html?utm_source=chatgpt.com "Window Customization - The Tauri Documentation WIP"
