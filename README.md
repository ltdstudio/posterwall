# MoviePilot-Plugins (edmond)

MoviePilot V2 第三方插件仓库。

## 插件列表

### 全屏海报墙 FullScreenPosterWall

抓取 MoviePilot 推荐媒体（流行趋势 / TMDB 热门电影 / TMDB 热门电视剧）的海报图片，以多种动效全屏展示：

- 照片（幻灯）
- 不断变化的拼贴
- 纵深穿梭
- 滑动面板
- 浮动
- 怀旧冲印
- 光舞

特性：

- 海报图优先使用 Fanart.tv 原生带片名横图，无原生图时以 TMDB 官方 Logo 叠加背景图
- 支持局域网络海报墙页面（lan-wall），可在电视等设备浏览器直接打开
- 支持仪表板 Widget、插件详情页预览，效果与全屏一致

## 安装方法

1. 在 MoviePilot `环境变量` 的 `PLUGIN_MARKET` 中追加本仓库地址（V2 也可在 插件 → 插件市场设置 中添加）：

   ```
   https://github.com/<你的用户名>/MoviePilot-Plugins
   ```

2. 重启 MoviePilot 后，进入 **插件市场** 找到「全屏海报墙」安装即可。

> 需要 MoviePilot >= 2.12.0；安装/更新插件需要能正常访问 GitHub（可配置 `GITHUB_TOKEN` / `GITHUB_PROXY`）。

## 仓库结构

```text
├── package.v2.json                          # V2 插件市场索引
├── icons/                                   # 插件图标
└── plugins.v2/
    └── fullscreenposterwall/                # 插件目录（类名小写）
        ├── __init__.py                      # 插件后端主类
        ├── dist/                            # Vue 联邦远程组件构建产物
        └── src/                             # 前端源码（vite + Vue3）
```

## 开发

前端构建：

```bash
cd plugins.v2/fullscreenposterwall
npm install
npm run build   # 产物输出到 dist/
```

后端为单文件 `_PluginBase` 实现，修改 `__init__.py` 后同步更新 `package.v2.json` 中的 `version`（必须与 `plugin_version` 一致）即可提示用户升级。

## License

MIT
