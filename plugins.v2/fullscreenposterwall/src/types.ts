/** 全屏海报墙前端共享类型定义。 */

export interface PosterItem {
  source: string;          // "trending" | "tmdb_movies" | "tmdb_tvs"
  title: string;
  year?: string;
  type?: string;           // "电影" | "电视剧"
  overview?: string;
  vote_average?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  logo_path?: string | null;
  thumb_path?: string | null;          // Fanart 原生带 Logo 的横图
  fanart_poster_path?: string | null;  // Fanart 带片名海报
  tmdb_id?: number | null;
  release_date?: string | null;
}

export interface PluginConfig {
  enabled: boolean;
  sources: string[];
  effect: 'photos' | 'floating' | 'vintage' | 'lightdance' | 'shiftingtiles' | 'slidingpanels' | 'ring3d' | 'depthtunnel' | string;
  interval: number;        // 秒
  image_type: 'backdrop' | 'poster' | string;
  refresh_minutes: number;
  autoplay: boolean;
  tmdb_image_domain: string;
}

/** 取图片完整 URL：TMDB 路径需要拼域名；豆瓣/其他已经是完整 URL。
 *  logo 模式 = 带 Logo 的背景大图：主图用 backdrop，片名艺术字由 pickLogoUrl 叠层显示。 */
export function pickImageUrl(item: PosterItem, type: 'backdrop' | 'poster' | 'logo' | string, domain: string): string {
  let path: string | null | undefined;
  if (type === 'poster') path = item.poster_path || item.backdrop_path;
  else if (type === 'logo') path = item.thumb_path || item.fanart_poster_path || item.backdrop_path || item.poster_path;
  else path = item.backdrop_path || item.poster_path;
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/')) return domain + path;
  return domain + '/' + path;
}

/** 是否已有「原生带 Logo 的图」（有则主图自带片名，无需再叠透明 Logo）。 */
export function hasNativeLogoImage(item: PosterItem): boolean {
  return !!(item.thumb_path || item.fanart_poster_path);
}

/** 取片名 Logo（透明艺术字图）URL；没有则返回空串。 */
export function pickLogoUrl(item: PosterItem, domain: string): string {
  const path = item.logo_path;
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/')) return domain + path;
  return domain + '/' + path;
}