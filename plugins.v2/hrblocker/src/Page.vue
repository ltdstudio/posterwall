<template>
  <div class="hrb-page">
    <!-- ─── 顶部信息条：标题 + 版本号 + 设置按钮（与全屏海报墙同一惯例） ─── -->
    <div class="hrb-header">
      <div class="hrb-title">
        <v-icon icon="mdi-shield-alert" size="34" color="error" class="mr-2" />
        <div>
          <div class="d-flex align-center">
            <h2 class="ma-0">H&amp;R Blocker</h2>
            <v-chip class="ml-2" size="x-small" variant="tonal" color="grey">{{ version }}</v-chip>
          </div>
          <div class="hrb-meta-line">
            已屏蔽 {{ total }} 条 H&amp;R 种子
            <template v-if="hrSites > 0"> · 联动 {{ hrSites }} 个全站H&amp;R站点</template>
          </div>
        </div>
      </div>
      <div class="hrb-header-actions">
        <v-btn
          icon="mdi-cog-outline"
          variant="text"
          size="small"
          title="插件设置"
          @click="openSettings"
        />
      </div>
    </div>

    <!-- ─── 中部：查看屏蔽记录入口 ─── -->
    <div class="hrb-center">
      <v-btn
        color="error"
        variant="tonal"
        size="large"
        prepend-icon="mdi-format-list-bulleted"
        @click="openDialog"
      >
        查看屏蔽记录
      </v-btn>
      <div class="text-caption text-disabled mt-3">
        保留最近 {{ maxRecords }} 条
      </div>
    </div>

    <!-- 屏蔽记录弹出窗口 -->
    <v-dialog v-model="dialog" max-width="560" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center py-2 px-4">
          <v-icon icon="mdi-shield-alert" class="mr-2" color="error" size="20" />
          <span class="text-subtitle-1">H&amp;R 屏蔽记录</span>
          <v-chip class="ml-2" size="x-small" color="error" variant="tonal">
            {{ records.length }} / {{ maxRecords }}
          </v-chip>
          <v-spacer />
          <v-btn
            icon="mdi-refresh"
            variant="text"
            size="small"
            :loading="loading"
            @click="fetchRecords"
          />
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-2" style="height: 420px;">
          <div v-if="records.length === 0 && !loading" class="hrb-empty">
            <v-icon icon="mdi-shield-check-outline" size="40" color="success" class="mb-2" />
            <div class="text-medium-emphasis text-body-2">暂无屏蔽记录</div>
            <div class="text-caption text-disabled mt-1">被拦截的 H&amp;R 种子会显示在这里</div>
          </div>

          <div v-for="(rec, i) in records" :key="i" class="hrb-item">
            <div class="d-flex align-center">
              <v-chip
                size="x-small"
                :color="rec.stage === '下载拦截' ? 'deep-orange' : 'warning'"
                variant="flat"
                class="mr-2 flex-shrink-0"
              >{{ rec.stage }}</v-chip>
              <span class="hrb-title" :title="rec.title">{{ rec.title }}</span>
            </div>
            <div class="hrb-item-meta">
              <span>{{ rec.time }}</span>
              <span v-if="rec.site">站点：{{ rec.site }}</span>
              <span>{{ rec.reason }}</span>
              <span v-if="rec.source">来源：{{ rec.source }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  api: { type: Object, default: null },
})

// 通知宿主切到 Config 弹窗（宿主插件页监听 @switch，见 PluginConfigDialog）
const emit = defineEmits(['switch'])

const records = ref([])
const total = ref(0)
const maxRecords = ref(100)
const version = ref('')
const hrSites = ref(0)
const loading = ref(false)
const dialog = ref(false)
let timer = null

function getApi() {
  return props.api || (typeof window !== 'undefined' ? window.MoviePilotAPI : null)
}

function unwrap(raw) {
  // 主框架 axios 已解包；仅当顶层没有 success 字段时才再解一层（防止误吞内层 data）
  return (raw && typeof raw === 'object' && 'success' in raw) ? raw : (raw?.data ?? raw)
}

async function fetchRecords() {
  const api = getApi()
  if (!api) return
  loading.value = true
  try {
    const payload = unwrap(await api.get('plugin/HRBlocker/records'))
    const list = payload?.records ?? payload?.data?.records
    if (Array.isArray(list)) {
      records.value = list
      total.value = payload?.total ?? payload?.data?.total ?? list.length
      maxRecords.value = payload?.max_records ?? payload?.data?.max_records ?? 100
    }
  } catch (e) {
    console.error('[HRBlocker] 加载屏蔽记录失败', e)
  } finally {
    loading.value = false
  }
}

async function fetchStatus() {
  const api = getApi()
  if (!api) return
  try {
    const payload = unwrap(await api.get('plugin/HRBlocker/status'))
    const body = payload?.data ?? payload
    version.value = body?.version ? `v${body.version}` : ''
    hrSites.value = Array.isArray(body?.hr_active_sites) ? body.hr_active_sites.length : 0
  } catch (e) {
    console.error('[HRBlocker] 加载状态失败', e)
  }
}

function openSettings() {
  emit('switch') // 宿主切到 Config 弹窗
}

function openDialog() {
  dialog.value = true
  fetchRecords()
}

onMounted(() => {
  fetchRecords()
  fetchStatus()
  // 轻量轮询：仅弹窗打开时刷新列表
  timer = setInterval(() => { if (dialog.value) fetchRecords() }, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.hrb-page {
  width: 100%;
}

.hrb-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 4px 4px 0;
}

.hrb-title {
  display: flex;
  align-items: center;
}

.hrb-meta-line {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 2px;
}

.hrb-header-actions {
  display: flex;
  align-items: center;
}

.hrb-center {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hrb-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hrb-item {
  padding: 6px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.hrb-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.hrb-title {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hrb-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
  margin-top: 2px;
  font-size: 11px;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
</style>
