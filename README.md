# posterwall — MoviePilot V2 插件仓库 (ltdstudio)

MoviePilot V2 第三方插件仓库。

## 插件列表

### 全屏海报墙 FullScreenPosterWall

这是一个全屏海报墙插件，让所有终端可以播放精美的电影海报。

从动态数据源抓取海报图片，以多种动效全屏展示；电视、平板、手机等任意带浏览器的设备均可作为播放终端。

**展示动效（8 种）**

- 照片（幻灯）
- 流动拼贴
- 纵深穿梭
- 滑动面板
- 浮动（漂移）
- 怀旧冲印
- 光舞
- 3D 环形画廊（极光氛围背景 + 螺旋飞出切换）

**数据源**

- 动态读取系统推荐链，跟随系统增减；每个源可分别勾选电影/电视剧
- 支持下拉多选：TMDB 热门、流行趋势、豆瓣、AniList 等（以系统可用源为准）
- 海报数量可配（30 / 60 / 120 / 180 / 240），按源自动分页拉取

**图片模式**

- 背景大图 / 带 Logo 的背景大图 / 海报 三种模式
- logo 模式优先使用 Fanart.tv 原生带片名横图，按**实际加载结果**决定是否叠加 TMDB 官方 Logo
- 图片统一走服务器代理缓存（多设备共享 7 天磁盘缓存），加载失败在同条目内按候选链自动回退
- 竖屏设备优先使用竖版海报图

**终端播放**

- 局域网海报墙页面（lan-wall）：免认证，电视等设备浏览器直接打开，支持全屏浮动按钮
- 图片/Logo 拉取状态实时显示（插件页与 lan-wall 双端）
- 仪表板 Widget、插件详情页预览，效果与全屏一致
- 切换间隔、自动播放、随机乱序、隐藏文字等选项

## 安装方法

1. 在 MoviePilot `环境变量` 的 `PLUGIN_MARKET` 中追加本仓库地址（V2 也可在 插件 → 插件市场设置 中添加）：

   ```
   https://github.com/ltdstudio/posterwall
   ```

2. 重启 MoviePilot 后，进入 **插件市场** 找到「全屏海报墙」安装即可。

> 本插件已合并入官方插件市场（[MoviePilot-Plugins](https://github.com/jxxghp/MoviePilot-Plugins)），默认仓库列表的用户可直接搜索安装。
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
