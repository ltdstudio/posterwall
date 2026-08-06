import { importShared } from './__federation_fn_import-JrT3xvdd.js';

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createElementVNode:_createElementVNode,toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,withCtx:_withCtx,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,renderList:_renderList,Fragment:_Fragment,createBlock:_createBlock} = await importShared('vue');


const _hoisted_1 = { class: "hrb-box" };
const _hoisted_2 = {
  key: 0,
  class: "hrb-empty"
};
const _hoisted_3 = { class: "text-caption text-disabled mt-1" };
const _hoisted_4 = { class: "hrb-item-head" };
const _hoisted_5 = { class: "hrb-time" };
const _hoisted_6 = ["title"];
const _hoisted_7 = { class: "hrb-meta" };
const _hoisted_8 = {
  key: 0,
  class: "hrb-meta-item"
};
const _hoisted_9 = { class: "hrb-meta-item" };
const _hoisted_10 = {
  key: 1,
  class: "hrb-meta-item"
};

const {onBeforeUnmount,onMounted,ref} = await importShared('vue');



const _sfc_main = {
  __name: 'Page',
  props: {
  api: { type: Object, default: null },
},
  setup(__props) {

const props = __props;

const records = ref([]);
const maxRecords = ref(100);
const loading = ref(false);
let timer = null;

function getApi() {
  return props.api || (typeof window !== 'undefined' ? window.MoviePilotAPI : null)
}

async function fetchRecords() {
  const api = getApi();
  if (!api) return
  loading.value = true;
  try {
    const raw = await api.get('plugin/HRBlocker/records');
    // 主框架 axios 已解包；仅当顶层没有 success 字段时才再解一层（防止误吞内层 data）
    const payload = (raw && typeof raw === 'object' && 'success' in raw) ? raw : (raw?.data ?? raw);
    const list = payload?.records ?? payload?.data?.records;
    if (Array.isArray(list)) {
      records.value = list;
      maxRecords.value = payload?.max_records ?? payload?.data?.max_records ?? 100;
    }
  } catch (e) {
    console.error('[HRBlocker] 加载屏蔽记录失败', e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchRecords();
  timer = setInterval(fetchRecords, 5000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_chip = _resolveComponent("v-chip");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_divider = _resolveComponent("v-divider");
  const _component_v_card = _resolveComponent("v-card");

  return (_openBlock(), _createBlock(_component_v_card, {
    class: "hrb-card",
    variant: "flat"
  }, {
    default: _withCtx(() => [
      _createVNode(_component_v_card_title, { class: "d-flex align-center py-3 px-4" }, {
        default: _withCtx(() => [
          _createVNode(_component_v_icon, {
            icon: "mdi-shield-alert",
            class: "mr-2",
            color: "error"
          }),
          _cache[0] || (_cache[0] = _createElementVNode("span", null, "H&R 屏蔽记录", -1)),
          _createVNode(_component_v_chip, {
            class: "ml-3",
            size: "small",
            color: "error",
            variant: "tonal"
          }, {
            default: _withCtx(() => [
              _createTextVNode(_toDisplayString(records.value.length) + " / " + _toDisplayString(maxRecords.value), 1)
            ]),
            _: 1
          }),
          _createVNode(_component_v_spacer),
          _createVNode(_component_v_btn, {
            icon: "mdi-refresh",
            variant: "text",
            size: "small",
            loading: loading.value,
            onClick: fetchRecords
          }, null, 8, ["loading"])
        ]),
        _: 1
      }),
      _createVNode(_component_v_divider),
      _createElementVNode("div", _hoisted_1, [
        (records.value.length === 0 && !loading.value)
          ? (_openBlock(), _createElementBlock("div", _hoisted_2, [
              _createVNode(_component_v_icon, {
                icon: "mdi-shield-check-outline",
                size: "48",
                color: "success",
                class: "mb-2"
              }),
              _cache[1] || (_cache[1] = _createElementVNode("div", { class: "text-medium-emphasis" }, "暂无屏蔽记录", -1)),
              _createElementVNode("div", _hoisted_3, "被拦截的 H&R 种子会显示在这里（保留最近 " + _toDisplayString(maxRecords.value) + " 条）", 1)
            ]))
          : _createCommentVNode("", true),
        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(records.value, (rec, i) => {
          return (_openBlock(), _createElementBlock("div", {
            key: i,
            class: "hrb-item"
          }, [
            _createElementVNode("div", _hoisted_4, [
              _createVNode(_component_v_chip, {
                size: "x-small",
                color: rec.stage === '下载拦截' ? 'deep-orange' : 'warning',
                variant: "flat",
                class: "mr-2"
              }, {
                default: _withCtx(() => [
                  _createTextVNode(_toDisplayString(rec.stage), 1)
                ]),
                _: 2
              }, 1032, ["color"]),
              _createElementVNode("span", _hoisted_5, _toDisplayString(rec.time), 1)
            ]),
            _createElementVNode("div", {
              class: "hrb-title",
              title: rec.title
            }, _toDisplayString(rec.title), 9, _hoisted_6),
            _createElementVNode("div", _hoisted_7, [
              (rec.site)
                ? (_openBlock(), _createElementBlock("span", _hoisted_8, [
                    _createVNode(_component_v_icon, {
                      icon: "mdi-server",
                      size: "12",
                      class: "mr-1"
                    }),
                    _createTextVNode(_toDisplayString(rec.site), 1)
                  ]))
                : _createCommentVNode("", true),
              _createElementVNode("span", _hoisted_9, [
                _createVNode(_component_v_icon, {
                  icon: "mdi-tag-outline",
                  size: "12",
                  class: "mr-1"
                }),
                _createTextVNode(_toDisplayString(rec.reason), 1)
              ]),
              (rec.source)
                ? (_openBlock(), _createElementBlock("span", _hoisted_10, [
                    _createVNode(_component_v_icon, {
                      icon: "mdi-source-branch",
                      size: "12",
                      class: "mr-1"
                    }),
                    _createTextVNode(_toDisplayString(rec.source), 1)
                  ]))
                : _createCommentVNode("", true)
            ])
          ]))
        }), 128))
      ])
    ]),
    _: 1
  }))
}
}

};
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-383d6f92"]]);

export { Page as default };
