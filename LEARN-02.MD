下面是补充完善后的 **Tauri v2 桌面应用** 分享文档，聚焦于“自动更新机制（unpackaging/updating）”的实战深度，结构清晰、示例适量实用。

---

## 进一步深入：Tauri v2 的自动更新机制（Auto-Updater）

### 1. 更新机制概览

Tauri v2 提供了通过插件实现的应用自动更新功能。其核心流程：

* 前端启动时或手动触发时，会从配置的 `endpoints`（可指向静态 JSON 或动态服务）检查是否有最新版本。
* 若发现更新，将下载签名后的二进制文件、验证签名，再替换旧版本并重启应用完成更新。([Tauri][1], [thatgurjot.com][2])

---

### 2. 配置自动更新插件与签名机制

#### a. 添加依赖

在 Rust 后端添加自动更新和对话框插件：

```toml
[dependencies]
tauri-plugin-updater = "2.0.0"
tauri-plugin-dialog = "2.0.0"
tauri-plugin-process = "2.0.0"
```

同时添加前端依赖：

```bash
npm install @tauri-apps/plugin-updater @tauri-apps/plugin-dialog
```

([Docs][3], [ratulmaharaj.com][4])

#### b. 权限配置

在 `src-tauri/capabilities/main.json` 中允许相关权限：

```json
"permissions": [
  "dialog:default",
  "updater:default",
  "process:default",
  "process:allow-restart"
]
```

([Docs][3])

#### c. 生成签名密钥

使用 CLI 生成一对公钥/私钥：

```bash
npm exec tauri signer generate -- -w ~/.tauri/myapp.key
```

生成后将私钥安全存储，公钥内容需配置入 `tauri.conf.json` 中([Docs][3], [Tauri][1])。

#### d. 更新配置文件 (`tauri.conf.json`)

启用更新功能，指明更新源及公钥，并开启构建时自动生成更新产物：

```json
"bundle": {
  "createUpdaterArtifacts": true
},
"plugins": {
  "updater": {
    "active": true,
    "endpoints": ["https://your-host/latest.json"],
    "dialog": true,
    "pubkey": "-----BEGIN PUBLIC KEY...-----"
  }
}
```

([Tauri][1])

---

### 3. 更新源示例结构：静态 JSON (`latest.json`)

在 GitHub Releases 或静态服务上放置类似：

```json
{
  "version": "v1.0.1",
  "notes": "优化性能，修复若干 bug",
  "pub_date": "2025-08-01T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "url": "https://.../app-x64-setup.zip",
      "signature": "签名内容 ANSI(Base64)..."
    }
  }
}
```

字段说明包括版本号、发布日期、下载 URL 和签名，Tauri 会验证签名后继续自动安装。([Tauri][1], [thatgurjot.com][2])

---

### 4. 前端触发更新行为示例

```js
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/tauri';

async function checkForAppUpdates(onButtonClick = false) {
  const update = await check();
  if (!update) {
    if (onButtonClick) await message('更新检查失败', { title: '错误', kind: 'error' });
    return;
  }
  if (update.available) {
    const yes = await ask(`发现新版本 ${update.version}！\n${update.body}`, { title: '更新可用', okLabel: '更新', cancelLabel: '取消' });
    if (yes) {
      await update.downloadAndInstall();
      await invoke('graceful_restart');
    }
  } else if (onButtonClick) {
    await message('当前已是最新版本', { title: '无需更新', kind: 'info' });
  }
}
```

([thatgurjot.com][2])

---

### 5. 更新过程中的注意点与技巧

* **用户数据安全**：自动更新仅替换安装目录中的文件，不会影响存在配置目录中的用户数据（如 app config）([GitHub][5])。
* **自定义更新服务**：可用静态 JSON，也可搭建动态服务器响应状态码（204=无更新，200+JSON=更新）([Tauri][1])。
* **自动化 CI/CD**：可配置 GitHub Actions 自动生成 release、构建二进制、更新 `latest.json`，实现真正“零手动”的发布流程([thatgurjot.com][2], [ratulmaharaj.com][4])。

---

## 更新部分实战分享结构示意（约 6 分钟）

1. **目的说明**：为何需要自动更新，以及自动更新的用户体验与维护成本优势（1分）
2. **关键配置展示**：签名密钥生成、`tauri.conf.json` 插件配置（1分）
3. **示例 JSON 结构**：`latest.json` 内容说明（1分）
4. **前端调用流程**：`check()`、`downloadAndInstall()`、重启逻辑（2分）
5. **注意事项汇总**：数据隔离、安全性、服务端选择（1分）

---

如你希望进一步加入 like "更新失败时的回滚机制"、"原子更新"等进阶内容，也欢迎继续告诉我，我可以接着深化！

[1]: https://v2.tauri.app/plugin/updater/?utm_source=chatgpt.com "Updater - Tauri"
[2]: https://thatgurjot.com/til/tauri-auto-updater/?utm_source=chatgpt.com "How to make automatic updates work with Tauri v2 and GitHub"
[3]: https://docs.crabnebula.dev/cloud/guides/auto-updates-tauri/?utm_source=chatgpt.com "Tauri v2 with Auto-Updater - Docs - CrabNebula"
[4]: https://ratulmaharaj.com/posts/tauri-automatic-updates/?utm_source=chatgpt.com "Tauri v2 updater - Ratul's Blog"
[5]: https://github.com/tauri-apps/tauri/discussions/7102?utm_source=chatgpt.com "Auto updater to save/skip updating user data or preferences? #7102"
