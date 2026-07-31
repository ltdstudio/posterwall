<template>
  <!-- 环形画廊：照片排在 3D 圆柱环上，周期性步进旋转，正面照片聚焦 -->
  <div class="ring-root">
    <div class="ring-stage">
      <div class="ring" :style="ringStyle">
        <div
          v-for="(c, i) in cards"
          :key="i"
          class="ring-card"
          :class="{ front: i === frontIndex }"
          :style="cardStyle(i)"
        >
          <img v-if="c.url" :src="c.url" alt="" draggable="false" />
          <img v-if="imageType === 'logo' && c.logo" :src="c.logo" class="rg-logo" alt="" @load="onLogoLoad" />
        </div>
      </div>
    </div>
    <div class="ring-floor" />
    <div v-if="front" class="ring-meta">
      <img v-if="imageType === 'logo' && !hasNativeLogoImage(front) && logoUrl(front)" :src="logoUrl(front)" class="meta-logo" :class="{ 'meta-center': logoWide }" alt="" @load="onLogoLoad" />
      <template v-else>
        <div class="ring-title">{{ front.title }}</div>
        <div class="ring-sub">{{ front.year }}<span v-if="front.year && front.type"> · </span>{{ front.type }}</div>
      </template>
      <div v-if="front.overview" class="ring-overview">{{ trimOverview(front.overview, 110) }}</div>
    </div>
    <div class="ring-vignette" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import type { PosterItem, PluginConfig } from '../types';
import { pickImageUrl, pickLogoUrl, hasNativeLogoImage } from '../types';

const props = withDefaults(defineProps<{
  items: PosterItem[];
  imageType?: string;
  active?: boolean;
}>(), { imageType: 'backdrop', active: true });

const cfg = ref<PluginConfig>({ tmdb_image_domain: 'https://image.tmdb.org/t/p/original' } as PluginConfig);
fetch('/api/v1/plugin/FullScreenPosterWall/config')
  .then(r => r.json()).then(d => { if (d?.data) cfg.value = d.data; }).catch(() => {});

const imageType = ref(props.imageType);
watch(() => props.imageType, v => { imageType.value = v || 'backdrop'; });

const N = 10;                        // 环上照片数
const cards = ref<{ url: string; logo: string; item: PosterItem | null }[]>([]);
const rotation = ref(0);             // 当前环角度
const step = 360 / N;
const radius = ref(600);
const frontIndex = ref(0);
let cursor = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const logoWide = ref(false);

function imageUrl(item: PosterItem): string {
  return pickImageUrl(item, props.imageType as any, cfg.value.tmdb_image_domain);
}
function logoUrl(item: PosterItem): string {
  return pickLogoUrl(item, cfg.value.tmdb_image_domain);
}
function onLogoLoad(e: Event) {
  const i = e.target as HTMLImageElement;
  i.classList.toggle('logo-wide', i.naturalWidth >= i.naturalHeight);
  logoWide.value = i.naturalWidth >= i.naturalHeight;
}
function trimOverview(s: string, max = 160) { return s && s.length > max ? s.slice(0, max) + '…' : (s || ''); }

const front = computed<PosterItem | null>(() => cards.value[frontIndex.value]?.item || null);
const ringStyle = computed(() => ({
  transform: `translateZ(${-radius.value}px) rotateX(-6deg) rotateY(${rotation.value}deg)`,
}));
function cardStyle(i: number) {
  // 中间（正面）卡片放大；侧卡轮到正面时带缩放过渡
  const s = i === frontIndex.value ? ' scale(1.18)' : '';
  return { transform: `rotateY(${i * step}deg) translateZ(${radius.value}px)${s}` };
}

function computeRadius() {
  // 卡片宽约 30vw，保证环不内凹：R = (cardW/2) / tan(π/N)
  const cardW = Math.min(window.innerWidth * 0.50, 730);
  radius.value = Math.round((cardW / 2) / Math.tan(Math.PI / N)) + 40;
}

function build() {
  const list = props.items || [];
  cards.value = Array.from({ length: N }, (_, i) => {
    const it = list[(cursor++) % Math.max(1, list.length)] || null;
    return {
      url: it ? imageUrl(it) : '',
      logo: (it && !hasNativeLogoImage(it)) ? logoUrl(it) : '',
      item: it,
    };
  });
  rotation.value = 0;
  frontIndex.value = 0;
}

function rotate() {
  rotation.value -= step;
  frontIndex.value = (frontIndex.value + 1) % N;
  // 转到背后的卡片换成新照片（不可见时更新）
  const backIdx = (frontIndex.value + Math.floor(N / 2)) % N;
  const list = props.items || [];
  if (list.length) {
    const it = list[(cursor++) % list.length];
    const c = cards.value[backIdx];
    if (c) {
      c.url = imageUrl(it);
      c.logo = !hasNativeLogoImage(it) ? logoUrl(it) : '';
      c.item = it;
    }
  }
}

function onResize() { computeRadius(); }

onMounted(() => {
  computeRadius();
  build();
  window.addEventListener('resize', onResize);
  const iv = Math.max(4, cfg.value.interval || 8) * 1000;
  timer = setInterval(rotate, iv);
  document.addEventListener('visibilitychange', vis);
});
function vis() {
  if (document.hidden && timer) { clearInterval(timer); timer = null; }
  else if (!document.hidden && !timer) {
    timer = setInterval(rotate, Math.max(4, cfg.value.interval || 8) * 1000);
  }
}
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener('resize', onResize);
  document.removeEventListener('visibilitychange', vis);
});
watch(() => props.items, build, { deep: true });
</script>

<style scoped>
.ring-root { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, #101318 0%, #000 70%); overflow: hidden; }
.ring-stage {
  position: absolute; inset: 0;
  perspective: 1400px;
  perspective-origin: 50% 42%;
}
.ring {
  position: absolute; left: 50%; top: 42%;
  width: 0; height: 0;
  transform-style: preserve-3d;
  transition: transform 1.5s cubic-bezier(0.22, 0.68, 0.24, 1);
}
.ring-card {
  position: absolute;
  width: min(50vw, 730px); height: min(60vh, 675px);
  left: calc(min(50vw, 730px) / -2); top: calc(min(60vh, 675px) / -2);
  overflow: hidden;
  backface-visibility: hidden;
  filter: brightness(0.45) saturate(0.8);
  transition: filter 1.2s ease, transform 1.2s cubic-bezier(0.22, 0.68, 0.24, 1);
  background: #000;
}
.ring-card.front { filter: brightness(1) saturate(1); }
.ring-card img:not(.rg-logo) { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
.rg-logo {
  position: absolute; inset: 0; margin: auto;
  max-width: 75%; max-height: 55%; width: auto; height: auto;
  object-fit: contain; filter: drop-shadow(0 4px 16px rgba(0,0,0,.65)); pointer-events: none;
}
.rg-logo.logo-wide { inset: auto; margin: 0; left: 50%; bottom: 8%; transform: translateX(-50%); }
.ring-floor {
  position: absolute; left: 0; right: 0; bottom: 0; height: 32%;
  background: linear-gradient(to top, rgba(255,255,255,0.05), transparent);
  pointer-events: none;
}
.ring-meta {
  position: absolute; left: 48px; bottom: 42px; max-width: 560px;
  color: #fff; z-index: 3;
}
.ring-title { font-size: 42px; font-weight: 700; text-shadow: 0 2px 14px rgba(0,0,0,.8); }
.ring-sub { font-size: 15px; opacity: .8; margin-top: 6px; }
.ring-overview { font-size: 14px; opacity: .85; margin-top: 10px; line-height: 1.6; }
.meta-logo { max-width: 420px; max-height: 130px; object-fit: contain; object-position: left bottom; filter: drop-shadow(0 4px 16px rgba(0,0,0,.65)); }
.meta-center { display: block; margin: 0 auto; }
.ring-vignette {
  position: absolute; inset: 0; pointer-events: none; z-index: 2;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%);
}
</style>
