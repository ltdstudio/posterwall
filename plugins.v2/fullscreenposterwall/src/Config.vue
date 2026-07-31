<template>
  <div class="fspw-config-root pa-4">
    <v-card variant="outlined" class="pa-4 mb-3">
      <h3 class="mb-3">全屏海报墙 — 插件设置</h3>

      <v-switch
        v-model="local.enabled"
        label="启用插件"
        color="primary"
        hide-details
        class="mb-3"
      />

      <v-alert type="info" variant="tonal" class="mb-4" density="compact">
        启用后，插件详情页（Page）会提供全屏海报墙入口。
      </v-alert>

      <v-select
        v-model="local.sources"
        :items="sourceOptions"
        label="推荐数据源（多选）"
        multiple
        chips
        closable-chips
        density="comfortable"
        class="mb-3"
      />

      <v-select
        v-model="local.effect"
        :items="effectOptions"
        label="播放方式"
        density="comfortable"
        class="mb-3"
      />

      <v-select
        v-model="local.image_type"
        :items="imageTypeOptions"
        label="图片来源"
        density="comfortable"
        class="mb-3"
      />

      <v-text-field
        v-model.number="local.interval"
        label="切换间隔（秒）"
        type="number"
        :min="3" :max="30"
        density="comfortable"
        class="mb-3"
      />

      <v-text-field
        v-model.number="local.refresh_minutes"
        label="数据刷新间隔（分钟）"
        type="number"
        :min="5" :max="1440"
        density="comfortable"
        class="mb-3"
      />

      <v-switch
        v-model="local.autoplay"
        label="进入页面后自动播放"
        color="primary"
        hide-details
        density="comfortable"
        class="mb-3"
      />

      <v-switch
        v-model="local.show_dashboard"
        label="在首页仪表板显示此小窗格"
        color="primary"
        hide-details
        density="comfortable"
        class="mb-3"
      />

      <v-switch
        v-model="local.shuffle"
        label="随机乱序（每次全屏顺序不同）"
        color="primary"
        hide-details
        density="comfortable"
        class="mb-3"
      />

      <v-switch
        v-model="local.hide_text"
        label="隐藏文字（只看海报不看标题/年份）"
        color="primary"
        hide-details
        density="comfortable"
        class="mb-4"
      />

      <v-divider class="my-3" />

      <div class="d-flex justify-end gap-2">
        <v-btn variant="text" @click="onReset">重置默认</v-btn>
        <v-btn color="primary" @click="onSave">保存</v-btn>
      </div>
    </v-card>

    <v-card variant="outlined" class="pa-4">
      <h4 class="mb-2">使用说明</h4>
      <ol style="line-height:1.8; padding-left: 20px;">
        <li>在此开启插件并选择推荐数据源 + 播放方式。</li>
        <li>回到插件详情页，点击「进入全屏播放」按钮（或按 F 键）。</li>
        <li>全屏状态下按 Esc 或点击右上角 ✕ 退出。</li>
      </ol>
    </v-card>
  </div>
</template>

<script setup>
// 参考 MoviePilot-Plugins 官方 agenttokens 的 Config.vue 写法：
// 保存完全交给宿主前端（emit('save', cfg)），宿主会用 api.put('plugin/{id}', cfg)
// 持久化。在 baseURL='api/v1/' 的 axios 下，绝对不能在组件里写 'api/v1/plugin/...'，
// 否则会变成 'api/v1/api/v1/plugin/...'（404 双前缀）。
import { reactive, onMounted } from 'vue'

const props = defineProps({
  initialConfig: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['save', 'close'])

const sourceOptions = [
  { title: '流行趋势', value: 'trending' },
  { title: 'TMDB热门电影', value: 'tmdb_movies' },
  { title: 'TMDB热门电视剧', value: 'tmdb_tvs' },
]
const effectOptions = [
  { title: '照片 (Photos) — 幻灯片', value: 'photos' },
  { title: '流动拼贴 (Shifting Tiles)', value: 'shiftingtiles' },
  { title: '环形画廊 (Ring Gallery) — 3D 环廊', value: 'ring3d' },
  { title: '纵深穿梭 (Depth Tunnel)', value: 'depthtunnel' },
  { title: '滑动面板 (Sliding Panels)', value: 'slidingpanels' },
  { title: '浮动 (Floating) — 漂移', value: 'floating' },
  { title: '怀旧冲印 (Vintage Prints)', value: 'vintage' },
  { title: '光舞 (Light Dance)', value: 'lightdance' },
]
const imageTypeOptions = [
  { title: '背景大图 (backdrop)', value: 'backdrop' },
  { title: '带Logo的背景大图 (logo)', value: 'logo' },
  { title: '海报 (poster)', value: 'poster' },
]

const defaults = {
  enabled: false,
  sources: ['trending', 'tmdb_movies', 'tmdb_tvs'],
  effect: 'photos',
  image_type: 'backdrop',
  interval: 8,
  refresh_minutes: 60,
  autoplay: true,
  show_dashboard: true,
  shuffle: false,
  hide_text: false,
}

const local = reactive({ ...defaults })

onMounted(() => {
  // 用宿主传入的 initialConfig 覆盖默认值
  const ic = props.initialConfig
  if (ic && typeof ic === 'object') {
    Object.keys(defaults).forEach(k => {
      if (ic[k] !== undefined) local[k] = ic[k]
    })
  }
})

function onSave() {
  // 通知宿主前端保存：MoviePilot 监听 @save 然后用 api.put('plugin/{id}', cfg) 持久化
  emit('save', JSON.parse(JSON.stringify(local)))
}

function onReset() {
  Object.assign(local, defaults)
}
</script>

<style scoped>
.fspw-config-root { width: 100%; }
.gap-2 > * + * { margin-left: 8px; }
</style>
