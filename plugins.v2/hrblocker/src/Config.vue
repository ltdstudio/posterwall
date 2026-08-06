<template>
  <div class="hrb-config-root pa-4">
    <v-card variant="outlined" class="pa-4">
      <h3 class="mb-3">H&R Blocker — 插件设置</h3>

      <v-switch
        v-model="local.enabled"
        label="启用插件"
        color="primary"
        hide-details
        density="comfortable"
        class="mb-2"
      />
      <v-switch
        v-model="local.block_marked"
        label="屏蔽H&R标记种子"
        hint="屏蔽站点搜索结果中带有H&R标记的种子"
        persistent-hint
        color="primary"
        density="comfortable"
        class="mb-2"
      />
      <v-switch
        v-model="local.sync_assistant"
        label="联动H&R助手"
        hint="屏蔽H&R助手配置中已激活全站H&R的站点（该站所有种子均视为H&R）"
        persistent-hint
        color="primary"
        density="comfortable"
        class="mb-2"
      />
      <v-switch
        v-model="local.block_manual"
        label="拦截手动下载"
        hint="手动下载H&R种子时同样拦截（关闭则仅自动选择场景生效）"
        persistent-hint
        color="primary"
        density="comfortable"
        class="mb-2"
      />
      <v-switch
        v-model="local.notify"
        label="拦截通知"
        hint="拦截H&R种子时发送消息通知"
        persistent-hint
        color="primary"
        density="comfortable"
        class="mb-4"
      />

      <v-alert type="info" variant="tonal" density="compact" class="mb-4">
        工作方式：在「资源选择」阶段从候选列表中剔除H&R种子（订阅、搜索择优、豆瓣同步等自动场景均生效），
        并在「实际下载」前二次兜底拦截。H&R判定来源：①站点搜索结果中的H&R标记；
        ②H&R助手配置中 hr_active 已激活的全站H&R站点（需已安装并配置H&R助手）。
      </v-alert>

      <v-divider class="my-3" />
      <div class="d-flex justify-end gap-2">
        <v-btn variant="text" @click="onReset">重置默认</v-btn>
        <v-btn color="primary" @click="onSave">保存</v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
// 与全屏海报墙同一约定：保存交给宿主前端（emit('save', cfg)），
// 宿主会用 api.put('plugin/{id}', cfg) 持久化，组件内不直接写 API。
import { onMounted, reactive } from 'vue'

const props = defineProps({
  initialConfig: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['save', 'close'])

const defaults = {
  enabled: false,
  block_marked: true,
  sync_assistant: true,
  block_manual: true,
  notify: false,
}

const local = reactive({ ...defaults })

onMounted(() => {
  const ic = props.initialConfig
  if (ic && typeof ic === 'object') {
    Object.keys(defaults).forEach(k => {
      if (ic[k] !== undefined) local[k] = ic[k]
    })
  }
})

function onSave() {
  emit('save', JSON.parse(JSON.stringify(local)))
}

function onReset() {
  Object.assign(local, defaults)
}
</script>

<style scoped>
.hrb-config-root { width: 100%; }
.gap-2 > * + * { margin-left: 8px; }
</style>
