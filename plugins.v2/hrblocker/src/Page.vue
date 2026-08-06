<template>
  <v-card class="hrb-card" variant="flat">
    <v-card-title class="d-flex align-center py-3 px-4">
      <v-icon icon="mdi-shield-alert" class="mr-2" color="error" />
      <span>H&R 屏蔽记录</span>
      <v-chip class="ml-3" size="small" color="error" variant="tonal">
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
    </v-card-title>
    <v-divider />

    <!-- 固定大小记录框：高度固定，内部滚动 -->
    <div class="hrb-box">
      <div v-if="records.length === 0 && !loading" class="hrb-empty">
        <v-icon icon="mdi-shield-check-outline" size="48" color="success" class="mb-2" />
        <div class="text-medium-emphasis">暂无屏蔽记录</div>
        <div class="text-caption text-disabled mt-1">被拦截的 H&R 种子会显示在这里（保留最近 {{ maxRecords }} 条）</div>
      </div>

      <div v-for="(rec, i) in records" :key="i" class="hrb-item">
        <div class="hrb-item-head">
          <v-chip
            size="x-small"
            :color="rec.stage === '下载拦截' ? 'deep-orange' : 'warning'"
            variant="flat"
            class="mr-2"
          >{{ rec.stage }}</v-chip>
          <span class="hrb-time">{{ rec.time }}</span>
        </div>
        <div class="hrb-title" :title="rec.title">{{ rec.title }}</div>
        <div class="hrb-meta">
          <span v-if="rec.site" class="hrb-meta-item">
            <v-icon icon="mdi-server" size="12" class="mr-1" />{{ rec.site }}
          </span>
          <span class="hrb-meta-item">
            <v-icon icon="mdi-tag-outline" size="12" class="mr-1" />{{ rec.reason }}
          </span>
          <span v-if="rec.source" class="hrb-meta-item">
            <v-icon icon="mdi-source-branch" size="12" class="mr-1" />{{ rec.source }}
          </span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  api: { type: Object, default: null },
})

const records = ref([])
const maxRecords = ref(100)
const loading = ref(false)
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
      maxRecords.value = payload?.max_records ?? payload?.data?.max_records ?? 100
    }
  } catch (e) {
    console.error('[HRBlocker] 加载屏蔽记录失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecords()
  timer = setInterval(fetchRecords, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.hrb-card {
  width: 100%;
}

/* 固定大小的记录框 */
.hrb-box {
  height: 480px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 12px;
}

.hrb-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hrb-item {
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 6px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.hrb-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.hrb-item-head {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.hrb-time {
  font-size: 11px;
  opacity: 0.55;
  font-variant-numeric: tabular-nums;
}

.hrb-title {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hrb-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 3px;
}

.hrb-meta-item {
  font-size: 11px;
  opacity: 0.65;
  display: inline-flex;
  align-items: center;
}
</style>
