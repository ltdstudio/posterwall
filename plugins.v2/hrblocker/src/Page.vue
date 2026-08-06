<template>
  <!-- 插件页：保持极简，居中一个「查看屏蔽记录」入口按钮 -->
  <div class="hrb-page">
    <div class="hrb-center">
      <v-icon icon="mdi-shield-alert-outline" size="56" color="error" class="mb-4" />
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
        已屏蔽 {{ total }} 条 H&R 种子（保留最近 {{ maxRecords }} 条）
      </div>
    </div>

    <!-- 屏蔽记录弹出窗口 -->
    <v-dialog v-model="dialog" max-width="560" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center py-2 px-4">
          <v-icon icon="mdi-shield-alert" class="mr-2" color="error" size="20" />
          <span class="text-subtitle-1">H&R 屏蔽记录</span>
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
            <div class="text-caption text-disabled mt-1">被拦截的 H&R 种子会显示在这里</div>
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
            <div class="hrb-meta">
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

const records = ref([])
const total = ref(0)
const maxRecords = ref(100)
const loading = ref(false)
const dialog = ref(false)
let timer = null

function getApi() {
  return props.api || (typeof window !== 'undefined' ? window.MoviePilotAPI : null)
}

async function fetchRecords() {
  const api = getApi()
  if (!api) return
  loading.value = true
  try {
    const raw = await api.get('plugin/HRBlocker/records')
    // 主框架 axios 已解包；仅当顶层没有 success 字段时才再解一层（防止误吞内层 data）
    const payload = (raw && typeof raw === 'object' && 'success' in raw) ? raw : (raw?.data ?? raw)
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

function openDialog() {
  dialog.value = true
  fetchRecords()
}

onMounted(() => {
  fetchRecords()
  // 轻量轮询：仅弹窗打开时刷新列表，关闭时只低频刷新计数
  timer = setInterval(() => { if (dialog.value) fetchRecords() }, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.hrb-page {
  width: 100%;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hrb-center {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.hrb-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 10px;
  margin-top: 2px;
  font-size: 11px;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
</style>
