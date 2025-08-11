下面是更深入的 **Tauri v2 自动更新机制（Auto-Updater）** 分享文档，新增了「失败回滚」与「原子更新」等进阶内容，结构清晰、示例适量，并配以实用技巧。

---

## Tauri v2 自动更新机制（含失败回滚 & 原子更新）

### 1. 更新流程概览与插件依赖（简要回顾）

* 前端发起检查 `check()`，从 `latest.json` 或动态服务器获取更新信息，下载新版本并重启应用。([Tauri][1], [thatgurjot.com][2])
* 需添加插件依赖：

  * Rust 后端：`tauri-plugin-updater`, `tauri-plugin-dialog`, `tauri-plugin-process`
  * JS 前端：`@tauri-apps/plugin-updater`, `@tauri-apps/plugin-dialog`([Docs][3], [ratulmaharaj.com][4])

---

### 2. 原子更新（Atomic Update）

* Tauri 自动更新只操作安装目录，不会触及用户配置或数据所在的目录（如 appConfigDir）。这本质上就是一种原子式更新行为：只有当更新流程成功完成，才替换旧版本，从而避免中间状态。([GitHub][5])
* **最佳实践**：将用户数据与应用安装分开存储（如 appConfigDir），确保更新过程中不会误清数据。

---

### 3. 更新失败时的回滚机制（Rollback）

Tauri 默认不会提供完整的回滚功能。因此推荐如下方式自行实现：

* **版本记录对比**
  在应用启动或更新后，记录当前版本号（如写入配置）。下次启动时对照检查是否更新失败（如版本号不变或更新过程异常），若异常触发后端备用安装包或提示用户重启安装包手动恢复。

* **自定义钩子控制**
  即使没有平台级钩子，也可以在应用内部实现“更新前备份 + 更新后验证”步骤。如更新前将旧版本文件复制一份至临时目录，更新成功后删除备份，失败时恢复。

> 目前 Tauri 官方暂无统一跨平台“回滚 hook”机制，也暂未支持这一功能。([GitHub][5])

---

### 4. 实战示例：前端触发更新 + 简易 rollback 思路

```js
import { check } from '@tauri-apps/plugin-updater';
import { message, ask } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

async function checkWithRollback() {
  const prevVersion = await (async () => {
    try {
      return await readTextFile('last_version.txt', { baseDir: BaseDirectory.AppConfig });
    } catch { return null; }
  })();

  const update = await check();
  if (update?.available) {
    const ok = await ask(`发现更新 ${update.version}，是否更新？`, { title: '更新可用', okLabel: '是', cancelLabel: '否' });
    if (!ok) return;
    await writeTextFile('last_version.txt', update.currentVersion, { baseDir: BaseDirectory.AppConfig });

    try {
      await update.downloadAndInstall();
      await invoke('graceful_restart');
    } catch (e) {
      await writeTextFile('last_version.txt', prevVersion || '', { baseDir: BaseDirectory.AppConfig });
      await message('更新失败，已尝试回滚到旧版本', { title: '更新失败', kind: 'error' });
      // 可在此处引导用户执行手动恢复或重新安装等
    }
  } else {
    await message('已是最新版本', { title: '无需更新', kind: 'info' });
  }
}
```

---

## 章节时间建议（更新机制&进阶内容：约 6–8 分钟）

1. **自动更新机制回顾**（1 分钟）
2. **原子更新原理与用户数据隔离**（2 分钟）
3. **更新失败回滚思路与示例代码**（3–4 分钟）
4. **实用建议总结**（1 分钟）

---

如果你还希望加入如“UI 下载进度展示”、“Windows installMode 差异说明（如 passive / basicUi / quiet）”、“集成 CI/CD 自动更新发布流程”等细节，我可以继续帮你补充！

[1]: https://v2.tauri.app/plugin/updater/?utm_source=chatgpt.com "Updater - Tauri"
[2]: https://thatgurjot.com/til/tauri-auto-updater/?utm_source=chatgpt.com "How to make automatic updates work with Tauri v2 and GitHub"
[3]: https://docs.crabnebula.dev/cloud/guides/auto-updates-tauri/?utm_source=chatgpt.com "Tauri v2 with Auto-Updater - Docs - CrabNebula"
[4]: https://ratulmaharaj.com/posts/tauri-automatic-updates/?utm_source=chatgpt.com "Tauri v2 updater - Ratul's Blog"
[5]: https://github.com/tauri-apps/tauri/discussions/7102?utm_source=chatgpt.com "Auto updater to save/skip updating user data or preferences? #7102"
