"use strict";
(() => {
    const 配置 = {
        标题: '剧情推演分支',
        宽度: 368,
        默认位置: { right: 24, top: 96 },
        存储键: '悬浮选项栏状态',
        球露出比例: 0.5,
        吸附距离: 48,
        来源: [
            {
                标签: '剧情分支',
                特征: 'npp-host-container',
                提取: /<next_prompt>\s*([\s\S]*?)\s*<\/next_prompt>/is,
            },
        ],
    };
    const 根标识 = 'moyu-fc';
    const 隐藏标记 = 'data-moyu-fc-hidden';
    const 实例标记 = '__moyuFcGeneration';
    const 本代次 = (() => {
        try {
            const 上 = Number(window[实例标记] || 0);
            window[实例标记] = 上 + 1;
            return 上 + 1;
        }
        catch {
            return 1;
        }
    })();
    function 仍是当前实例() {
        try {
            return Number(window[实例标记] || 0) === 本代次;
        }
        catch {
            return true;
        }
    }
    const 粉色关键词 = [
        '色情', '腹肌', '内裤', '巨物', '青筋', '硬度', '性', '肉棒',
        '潮吹', '验货', '骚', '抽插', '肉体', '高潮', '调教', '深喉',
        '阴茎', '勃起', '精液', '胸肌', '吻', '脱', '摸', '做爱',
    ];
    function 父文档() {
        try {
            if (parent && parent.document && parent.document.body)
                return parent.document;
        }
        catch {
        }
        return document;
    }
    function 视口宽() {
        const 文档 = 父文档();
        return 文档.defaultView?.innerWidth ?? 文档.documentElement.clientWidth ?? 1024;
    }
    function 视口高() {
        const 文档 = 父文档();
        return 文档.defaultView?.innerHeight ?? 文档.documentElement.clientHeight ?? 768;
    }
    const 基准位置 = { 位置: null, 球位置: null };
    function 屏内夹紧(元素) {
        if (!元素 || 元素.hidden)
            return;
        const 宽 = 元素.offsetWidth;
        const 高 = 元素.offsetHeight;
        if (!宽 || !高)
            return;
        const 区域 = 元素.getBoundingClientRect();
        const 左 = Math.min(Math.max(0, 区域.left), Math.max(0, 视口宽() - 宽));
        const 上 = Math.min(Math.max(0, 区域.top), Math.max(0, 视口高() - 高));
        if (Math.abs(区域.left - 左) < 1 && Math.abs(区域.top - 上) < 1)
            return;
        元素.style.left = `${左}px`;
        元素.style.top = `${上}px`;
        元素.style.right = 'auto';
        元素.style.bottom = 'auto';
    }
    function 重摆并夹紧(位置键, 元素, 套默认) {
        if (!元素 || 元素.hidden)
            return;
        const 存 = 基准位置[位置键];
        if (存) {
            元素.style.left = `${存.left}px`;
            元素.style.top = `${存.top}px`;
            元素.style.right = 'auto';
            元素.style.bottom = 'auto';
        }
        else if (套默认) {
            元素.style.removeProperty('left');
            元素.style.removeProperty('top');
            套默认();
        }
        屏内夹紧(元素);
    }
    function 吸附球(元素, 边, 指定上) {
        const 区域 = 元素.getBoundingClientRect();
        const 宽 = 区域.width || 元素.offsetWidth;
        const 高 = 区域.height || 元素.offsetHeight;
        if (!宽 || !高)
            return null;
        const 露出 = Math.min(0.9, Math.max(0.1, 配置.球露出比例));
        const 上 = Math.min(
            Math.max(0, 指定上 != null ? 指定上 : 区域.top),
            Math.max(0, 视口高() - 高),
        );
        const 左 = 边 === 'left' ? -宽 * (1 - 露出) : 视口宽() - 宽 * 露出;
        元素.style.left = `${Math.round(左)}px`;
        元素.style.top = `${Math.round(上)}px`;
        元素.style.right = 'auto';
        元素.style.bottom = 'auto';
        delete 元素.dataset.free;
        元素.dataset.edge = 边;
        return { left: Math.round(左), top: Math.round(上), 边 };
    }
    function 停在原地(元素, 指定左, 指定上) {
        const 区域 = 元素.getBoundingClientRect();
        const 宽 = 区域.width || 元素.offsetWidth;
        const 高 = 区域.height || 元素.offsetHeight;
        if (!宽 || !高)
            return null;
        const 左 = Math.min(Math.max(0, 指定左 != null ? 指定左 : 区域.left), Math.max(0, 视口宽() - 宽));
        const 上 = Math.min(Math.max(0, 指定上 != null ? 指定上 : 区域.top), Math.max(0, 视口高() - 高));
        元素.style.left = `${Math.round(左)}px`;
        元素.style.top = `${Math.round(上)}px`;
        元素.style.right = 'auto';
        元素.style.bottom = 'auto';
        delete 元素.dataset.edge;
        元素.dataset.free = '1';
        return { left: Math.round(左), top: Math.round(上), 边: null, 自由: true };
    }
    function 平滑吸附(元素, 边, 指定上) {
        const 原过渡 = 元素.style.transition;
        元素.style.transition = 'left 0.24s cubic-bezier(0.22, 0.61, 0.36, 1), top 0.24s cubic-bezier(0.22, 0.61, 0.36, 1)';
        const 结果 = 吸附球(元素, 边, 指定上);
        setTimeout(() => {
            元素.style.transition = 原过渡;
        }, 260);
        return 结果;
    }
    function 摆放球() {
        if (!球体 || 球体.hidden)
            return;
        const 存 = 基准位置.球位置;
        if (存 && 存.边) {
            吸附球(球体, 存.边, 存.top);
            return;
        }
        if (存 && 存.自由) {
            停在原地(球体, 存.left, 存.top);
            return;
        }
        if (存) {
            const 边 = 存.left + 球体.offsetWidth / 2 < 视口宽() / 2 ? 'left' : 'right';
            吸附球(球体, 边, 存.top);
            return;
        }
        const 现场边 = 球体.dataset.edge;
        const 现场上 = 球体.getBoundingClientRect().top;
        if (现场边 === 'left' || 现场边 === 'right') {
            吸附球(球体, 现场边, 现场上);
            return;
        }
        if (球体.dataset.free === '1') {
            停在原地(球体, 球体.getBoundingClientRect().left, 现场上);
            return;
        }
        const 高 = 球体.getBoundingClientRect().height || 44;
        吸附球(球体, 'right', Math.max(0, 视口高() - 120 - 高));
    }
    function 夹紧当前可见() {
        if (!面板根 || !仍是当前实例())
            return;
        重摆并夹紧('位置', 面板体, () => {
            面板体.style.right = `${配置.默认位置.right}px`;
            面板体.style.top = `${配置.默认位置.top}px`;
        });
        摆放球();
    }
    function 请求动画帧夹紧() {
        const 视窗 = 父文档().defaultView;
        if (视窗 && typeof 视窗.requestAnimationFrame === 'function')
            视窗.requestAnimationFrame(() => 夹紧当前可见());
        else
            setTimeout(夹紧当前可见, 0);
    }
    function 转义文本(值) {
        return String(值 == null ? '' : 值)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    function 弹提示(消息, 类型 = 'success') {
        try {
            const t = parent?.toastr ?? window.toastr;
            if (t && typeof t[类型] === 'function')
                t[类型](消息);
            else
                console.log('[悬浮选项栏]', 消息);
        }
        catch {
            console.log('[悬浮选项栏]', 消息);
        }
    }
    function 清理思维链(文本) {
        if (!文本)
            return '';
        return 文本.replace(/^[\s\S]*<\/(?:think|thinking)>/i, '').trim();
    }
    function 解析选项(原文) {
        const 行们 = 清理思维链(原文).split('\n');
        const 结果 = [];
        行们.forEach(行 => {
            const 行文本 = 行.trim();
            if (!行文本)
                return;
            const 带编号 = 行文本.match(/^([A-Za-z0-9一二三四五六七八九十]+)\s*[:：]\s*(.+)$/);
            if (带编号) {
                结果.push({ 标签: 带编号[1].toUpperCase(), 内容: 带编号[2].trim() });
                return;
            }
            if (行文本.length > 2) {
                结果.push({ 标签: String.fromCharCode(65 + 结果.length), 内容: 行文本 });
            }
        });
        return 结果;
    }
    function 判定配色(内容) {
        const 小写 = 内容.toLowerCase();
        return 粉色关键词.some(词 => 小写.includes(词)) ? 'pink' : 'gold';
    }
    function 读取最新层数据() {
        const 结果 = [];
        try {
            const 末楼 = typeof getLastMessageId === 'function' ? getLastMessageId() : 0;
            const 消息们 = getChatMessages(`0-${末楼}`);
            let 末条AI = null;
            for (let i = 消息们.length - 1; i >= 0; i -= 1) {
                const 消息 = 消息们[i];
                if (消息 && 消息.role === 'assistant') {
                    末条AI = { message_id: 消息.message_id, message: String(消息.message || '') };
                    break;
                }
            }
            if (!末条AI)
                return [];
            for (const 源 of 配置.来源) {
                const 匹配 = 末条AI.message.match(源.提取);
                if (!匹配)
                    continue;
                const 选项 = 解析选项(匹配[1] ?? '');
                if (选项.length)
                    结果.push({ 楼层: 末条AI.message_id, 来源: 源, 选项 });
            }
        }
        catch (错误) {
            console.error('[悬浮选项栏] 读取消息失败：', 错误);
        }
        return 结果;
    }
    function 元素含特征(元素, 特征) {
        if (元素.tagName === 'IFRAME') {
            const 框 = 元素;
            try {
                if (String(框.getAttribute('srcdoc') || '').includes(特征))
                    return true;
            }
            catch {
            }
            try {
                const 内文 = 框.contentDocument;
                if (内文 && 内文.documentElement && 内文.documentElement.innerHTML.includes(特征))
                    return true;
            }
            catch {
            }
            return false;
        }
        try {
            return String(元素.textContent || '').includes(特征);
        }
        catch {
            return false;
        }
    }
    function 收起块(块, 楼层文本) {
        let 目标 = 块;
        let 上级 = 目标.parentElement;
        while (上级 && 上级 !== 楼层文本) {
            const 还有别的 = Array.from(上级.children).some(子 => {
                if (子 === 目标)
                    return false;
                const 标签 = 子.tagName;
                if (标签 === 'STYLE' || 标签 === 'LINK' || 标签 === 'SCRIPT')
                    return false;
                return String(子.textContent || '').trim().length > 0 || 子.tagName === 'IFRAME';
            });
            if (还有别的)
                break;
            目标 = 上级;
            上级 = 目标.parentElement;
        }
        目标.style.setProperty('display', 'none', 'important');
        目标.setAttribute(隐藏标记, '1');
    }
    function 隐藏楼层块() {
        const 文档 = 父文档();
        let 识别到 = 0;
        文档.querySelectorAll('#chat .mes_text').forEach(楼层文本 => {
            配置.来源.forEach(源 => {
                楼层文本.querySelectorAll('iframe, pre').forEach(候选 => {
                    if (!元素含特征(候选, 源.特征))
                        return;
                    if (候选.closest(`[${隐藏标记}]`))
                        return;
                    收起块(候选, 楼层文本);
                    识别到 += 1;
                });
            });
        });
        if (识别到 > 0)
            return;
        try {
            const 末楼 = typeof getLastMessageId === 'function' ? getLastMessageId() : 0;
            const 消息表 = new Map();
            getChatMessages(`0-${末楼}`).forEach(消息 => 消息表.set(消息.message_id, String(消息.message || '')));
            文档.querySelectorAll('#chat .mes[mesid]').forEach(楼层 => {
                const 编号 = Number(楼层.getAttribute('mesid'));
                const 原文 = 消息表.get(编号);
                if (!原文 || !配置.来源.some(源 => 源.提取.test(原文)))
                    return;
                const 楼层文本 = 楼层.querySelector('.mes_text');
                if (!楼层文本)
                    return;
                const 框们 = 楼层文本.querySelectorAll('iframe');
                const 末块 = 框们[框们.length - 1];
                if (末块 && !末块.closest(`[${隐藏标记}]`))
                    收起块(末块, 楼层文本);
            });
        }
        catch (错误) {
            console.debug('[悬浮选项栏] 兜底隐藏失败：', 错误);
        }
    }
    function 还原楼层块() {
        const 文档 = 父文档();
        文档.querySelectorAll(`[${隐藏标记}]`).forEach(块 => {
            块.style.removeProperty('display');
            块.removeAttribute(隐藏标记);
        });
    }
    let 面板根 = null;
    let 面板体 = null;
    let 列表区 = null;
    let 标签区 = null;
    let 球体 = null;
    let 当前数据们 = [];
    let 当前标签 = 配置.来源[0]?.标签 ?? '';
    function 读状态() {
        try {
            const 变量 = getVariables({ type: 'script' }) || {};
            const 值 = 变量[配置.存储键];
            if (值 && typeof 值 === 'object') {
                const 球位置 = 值.球位置;
                const 有球 = !!球位置 && typeof 球位置 === 'object'
                    && (typeof 球位置.left === 'number' || 球位置.边 === 'left' || 球位置.边 === 'right');
                return {
                    位置: 值.位置 && typeof 值.位置.left === 'number' ? 值.位置 : null,
                    球位置: 有球
                        ? {
                            边: 球位置.边 === 'left' || 球位置.边 === 'right' ? 球位置.边 : undefined,
                            left: typeof 球位置.left === 'number' ? 球位置.left : 0,
                            top: typeof 球位置.top === 'number' ? 球位置.top : 0,
                            自由: !!球位置.自由,
                        }
                        : null,
                    收起: !!值.收起,
                };
            }
        }
        catch {
        }
        return { 位置: null, 球位置: null, 收起: false };
    }
    function 存状态(补丁) {
        try {
            const 新 = { ...读状态(), ...补丁 };
            updateVariablesWith(变量 => {
                变量[配置.存储键] = 新;
                return 变量;
            }, { type: 'script' });
        }
        catch (错误) {
            console.debug('[悬浮选项栏] 保存状态失败：', 错误);
        }
    }
    const 图标 = {
        笔: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
        收: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
        球: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/></svg>',
    };
    function 注入样式(文档) {
        if (文档.getElementById(`${根标识}-style`))
            return;
        const 样式 = 文档.createElement('style');
        样式.id = `${根标识}-style`;
        样式.textContent = `
.${根标识} {
  position: fixed;
  inset: 0;
  z-index: 6000;
  pointer-events: none;
  font-family: 'Noto Serif SC', 'STSong', serif;
  --fc-bg: rgba(237, 231, 224, 0.96);
  --fc-border: rgba(184, 134, 106, 0.38);
  --fc-text: #3d3530;
  --fc-muted: #8a7a6e;
  --fc-rose: #c98888;
  --fc-gold: #b8866a;
  --fc-row-pink: linear-gradient(135deg, rgba(201, 136, 136, 0.18) 0%, rgba(237, 231, 224, 0.92) 100%);
  --fc-row-gold: linear-gradient(135deg, rgba(184, 134, 106, 0.18) 0%, rgba(237, 231, 224, 0.92) 100%);
  --fc-shadow: 0 18px 40px rgba(61, 53, 48, 0.28);
  color: var(--fc-text);
}
.${根标识}[hidden] { display: none; }
.${根标识}[data-theme='dark'] {
  --fc-bg: rgba(38, 33, 30, 0.96);
  --fc-border: rgba(184, 134, 106, 0.42);
  --fc-text: #ece4dc;
  --fc-muted: #a5968a;
  --fc-row-pink: linear-gradient(135deg, rgba(201, 136, 136, 0.22) 0%, rgba(52, 45, 41, 0.94) 100%);
  --fc-row-gold: linear-gradient(135deg, rgba(184, 134, 106, 0.22) 0%, rgba(52, 45, 41, 0.94) 100%);
  --fc-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
}
.${根标识}-panel {
  position: fixed;
  z-index: 6000;
  pointer-events: auto;
  
  box-sizing: border-box;
  width: min(${配置.宽度}px, calc(100vw - 32px));
  max-height: min(70vh, 560px);
  display: flex;
  flex-direction: column;
  background: var(--fc-bg);
  border: 1px solid var(--fc-border);
  border-radius: 16px;
  box-shadow: var(--fc-shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
  user-select: none;
}
.${根标识}-panel[hidden] { display: none; }
.${根标识}-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid rgba(184, 134, 106, 0.22);
  background: linear-gradient(90deg, rgba(201, 136, 136, 0.12), rgba(184, 134, 106, 0.12));
  cursor: grab;
  touch-action: none;
}
.${根标识}-head:active { cursor: grabbing; }
.${根标识}-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--fc-gold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${根标识}-title::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--fc-rose);
  box-shadow: 0 0 8px var(--fc-rose);
  flex-shrink: 0;
}
.${根标识}-min {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--fc-muted);
  cursor: pointer;
  flex-shrink: 0;
}
.${根标识}-min:hover { color: var(--fc-text); background: rgba(184, 134, 106, 0.16); }
.${根标识}-tabs {
  display: flex;
  gap: 6px;
  padding: 8px 12px 0;
  flex-wrap: wrap;
}
.${根标识}-tabs[hidden] { display: none; }
.${根标识}-tab {
  padding: 4px 11px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(184, 134, 106, 0.1);
  color: var(--fc-muted);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}
.${根标识}-tab[data-active='1'] {
  color: var(--fc-text);
  border-color: var(--fc-border);
  background: rgba(184, 134, 106, 0.2);
}
.${根标识}-feed {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(184, 134, 106, 0.35) transparent;
}
.${根标识}-feed::-webkit-scrollbar { width: 4px; }
.${根标识}-feed::-webkit-scrollbar-thumb { background: rgba(184, 134, 106, 0.35); border-radius: 4px; }
.${根标识}-row {
  display: flex;
  align-items: stretch;
  border: 1px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.${根标识}-row[data-tone='pink'] {
  background: var(--fc-row-pink);
  border-color: rgba(201, 136, 136, 0.5);
}
.${根标识}-row[data-tone='gold'] {
  background: var(--fc-row-gold);
  border-color: rgba(184, 134, 106, 0.55);
}
.${根标识}-row:hover { transform: translateY(-1px); }
.${根标识}-row[data-tone='pink']:hover { border-color: var(--fc-rose); box-shadow: 0 0 12px rgba(201, 136, 136, 0.4); }
.${根标识}-row[data-tone='gold']:hover { border-color: var(--fc-gold); box-shadow: 0 0 12px rgba(184, 134, 106, 0.4); }
.${根标识}-row[data-picked='1'] { opacity: 0.6; border-style: dashed; pointer-events: none; }
.${根标识}-send {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: var(--fc-text);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
  cursor: pointer;
}
.${根标识}-send:active { transform: scale(0.995); }
.${根标识}-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}
.${根标识}-row[data-tone='pink'] .${根标识}-tag {
  color: #ad6060;
  border: 1px solid var(--fc-rose);
  background: rgba(201, 136, 136, 0.28);
}
.${根标识}-row[data-tone='gold'] .${根标识}-tag {
  color: #8a5f42;
  border: 1px solid var(--fc-gold);
  background: rgba(184, 134, 106, 0.28);
}
.${根标识}[data-theme='dark'] .${根标识}-tag { color: #f0e6dc; }
.${根标识}-text { flex: 1; overflow-wrap: break-word; word-break: break-word; }
.${根标识}-fill {
  width: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-left: 1px solid rgba(184, 134, 106, 0.18);
  background: rgba(184, 134, 106, 0.1);
  color: var(--fc-muted);
  cursor: pointer;
  flex-shrink: 0;
}
.${根标识}-fill:hover { color: var(--fc-text); background: rgba(184, 134, 106, 0.26); }
.${根标识}-empty {
  padding: 18px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--fc-muted);
}
.${根标识}-ball {
  position: fixed;
  z-index: 6000;
  pointer-events: auto;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(184, 134, 106, 0.5);
  background: rgba(237, 231, 224, 0.94);
  color: #8a5f42;
  box-shadow: 0 8px 22px rgba(61, 53, 48, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  touch-action: none;
}
.${根标识}[data-theme='dark'] .${根标识}-ball {
  background: rgba(45, 39, 35, 0.94);
  color: #e0cdb8;
  border-color: rgba(184, 134, 106, 0.45);
}
.${根标识}-ball[hidden] { display: none; }
.${根标识}-ball:hover { border-color: var(--fc-gold); }

.${根标识}-ball[data-edge='right'] svg { transform: translateX(-12px); }
.${根标识}-ball[data-edge='left'] svg { transform: translateX(12px); }

.${根标识}-ball[data-dragging='1'] { transition: none !important; }
@media (max-width: 720px) {
  
  .${根标识}-panel { max-height: 58vh; max-height: 58dvh; }
}

@media (hover: none), (pointer: coarse) {
  .${根标识}-min { width: 32px; height: 32px; border-radius: 9px; }
  .${根标识}-ball { width: 48px; height: 48px; }
  .${根标识}-fill { width: 46px; }
}
`;
        文档.head.appendChild(样式);
    }
    function 建界面() {
        const 文档 = 父文档();
        const 已有 = 文档.getElementById(根标识);
        if (已有) {
            面板根 = 已有;
            面板体 = 已有.querySelector(`.${根标识}-panel`);
            列表区 = 已有.querySelector(`.${根标识}-feed`);
            标签区 = 已有.querySelector(`.${根标识}-tabs`);
            球体 = 已有.querySelector(`.${根标识}-ball`);
            return;
        }
        注入样式(文档);
        const 根 = 文档.createElement('div');
        根.id = 根标识;
        根.className = 根标识;
        根.innerHTML = `
    <div class="${根标识}-panel">
      <div class="${根标识}-head" data-drag="panel">
        <span class="${根标识}-title">${转义文本(配置.标题)}</span>
        <button class="${根标识}-min" type="button" title="收起">${图标.收}</button>
      </div>
      <div class="${根标识}-tabs" hidden></div>
      <div class="${根标识}-feed"></div>
    </div>
    <button class="${根标识}-ball" type="button" title="展开选项" hidden>${图标.球}</button>
  `;
        文档.body.appendChild(根);
        面板根 = 根;
        面板体 = 根.querySelector(`.${根标识}-panel`);
        列表区 = 根.querySelector(`.${根标识}-feed`);
        标签区 = 根.querySelector(`.${根标识}-tabs`);
        球体 = 根.querySelector(`.${根标识}-ball`);
        const 状态 = 读状态();
        基准位置.位置 = 状态.位置;
        基准位置.球位置 = 状态.球位置;
        if (状态.位置) {
            面板体.style.left = `${状态.位置.left}px`;
            面板体.style.top = `${状态.位置.top}px`;
        }
        else {
            面板体.style.right = `${配置.默认位置.right}px`;
            面板体.style.top = `${配置.默认位置.top}px`;
        }
        if (状态.球位置) {
            if (状态.球位置.边 === 'left' || 状态.球位置.边 === 'right') {
                球体.dataset.edge = 状态.球位置.边;
                球体.style.top = `${状态.球位置.top}px`;
            }
            else if (状态.球位置.自由) {
                球体.dataset.free = '1';
                球体.style.left = `${状态.球位置.left}px`;
                球体.style.top = `${状态.球位置.top}px`;
            }
            else {
                球体.style.left = `${状态.球位置.left}px`;
                球体.style.top = `${状态.球位置.top}px`;
            }
        }
        else {
            球体.style.right = '18px';
            球体.style.bottom = '120px';
        }
        面板体.hidden = 状态.收起;
        球体.hidden = !状态.收起;
        请求动画帧夹紧();
        根.querySelector(`.${根标识}-min`)?.addEventListener('pointerdown', 事件 => {
            事件.stopPropagation();
        });
        根.querySelector(`.${根标识}-min`)?.addEventListener('click', () => {
            面板体.hidden = true;
            球体.hidden = false;
            存状态({ 收起: true });
            请求动画帧夹紧();
        });
        球体.addEventListener('click', () => {
            const 拖动时刻 = Number(球体.dataset.draggedAt || 0);
            if (拖动时刻 && Date.now() - 拖动时刻 < 400) {
                delete 球体.dataset.draggedAt;
                return;
            }
            面板体.hidden = false;
            球体.hidden = true;
            存状态({ 收起: false });
            请求动画帧夹紧();
        });
        绑定拖动(面板体.querySelector(`.${根标识}-head`), 面板体, '位置');
        绑定拖动(球体, 球体, '球位置');
    }
    function 绑定拖动(把手, 目标, 位置键) {
        let 起点X = 0;
        let 起点Y = 0;
        let 起始左 = 0;
        let 起始上 = 0;
        let 拖动中 = false;
        把手.addEventListener('pointerdown', 事件 => {
            if (事件.button !== 0)
                return;
            const 区域 = 目标.getBoundingClientRect();
            起点X = 事件.clientX;
            起点Y = 事件.clientY;
            起始左 = 区域.left;
            起始上 = 区域.top;
            拖动中 = true;
            if (位置键 === '球位置')
                目标.dataset.dragging = '1';
            try {
                把手.setPointerCapture(事件.pointerId);
            }
            catch {
            }
        });
        把手.addEventListener('pointermove', 事件 => {
            if (!拖动中)
                return;
            const 是球 = 位置键 === '球位置';
            let 左下限 = 0;
            let 左上限 = Math.max(0, 视口宽() - 目标.offsetWidth);
            if (是球) {
                const 露出 = Math.min(0.9, Math.max(0.1, 配置.球露出比例));
                左下限 = -目标.offsetWidth * (1 - 露出);
                左上限 = 视口宽() - 目标.offsetWidth * 露出;
            }
            const 左 = Math.min(Math.max(左下限, 起始左 + 事件.clientX - 起点X), 左上限);
            const 上 = Math.min(Math.max(0, 起始上 + 事件.clientY - 起点Y), Math.max(0, 视口高() - 目标.offsetHeight));
            目标.style.left = `${左}px`;
            目标.style.top = `${上}px`;
            目标.style.right = 'auto';
            目标.style.bottom = 'auto';
            if (是球 && Math.abs(事件.clientX - 起点X) + Math.abs(事件.clientY - 起点Y) > 4) {
                目标.dataset.draggedAt = String(Date.now());
            }
        });
        const 结束 = () => {
            if (!拖动中)
                return;
            拖动中 = false;
            delete 目标.dataset.dragging;
            const 区域 = 目标.getBoundingClientRect();
            if (位置键 === '球位置') {
                const 离左 = 区域.left;
                const 离右 = 视口宽() - 区域.right;
                const 边上 = Math.min(离左, 离右) <= 配置.吸附距离;
                const 上 = Math.min(Math.max(0, 区域.top), Math.max(0, 视口高() - 区域.height));
                let 位置;
                if (边上) {
                    const 边 = 离左 <= 离右 ? 'left' : 'right';
                    位置 = 平滑吸附(目标, 边, 上);
                }
                else {
                    位置 = 停在原地(目标, 区域.left, 上);
                }
                基准位置[位置键] = 位置 ?? { left: Math.round(区域.left), top: Math.round(区域.top), 边: null };
                存状态({ [位置键]: 基准位置[位置键] });
                return;
            }
            const 位置 = { left: Math.round(区域.left), top: Math.round(区域.top) };
            基准位置[位置键] = 位置;
            存状态({ [位置键]: 位置 });
        };
        把手.addEventListener('pointerup', 结束);
        把手.addEventListener('pointercancel', 结束);
    }
    function 更新主题() {
        if (!面板根)
            return;
        const 文档 = 父文档();
        const 深色 = 文档.body.classList.contains('dark') || 文档.documentElement.classList.contains('dark');
        面板根.dataset.theme = 深色 ? 'dark' : 'light';
    }
    function 渲染标签() {
        if (!标签区)
            return;
        if (当前数据们.length <= 1) {
            标签区.hidden = true;
            return;
        }
        标签区.hidden = false;
        标签区.innerHTML = 当前数据们
            .map(数据 => {
            const 激活 = 数据.来源.标签 === 当前标签 ? '1' : '0';
            return `<button type="button" class="${根标识}-tab" data-tab="${转义文本(数据.来源.标签)}" data-active="${激活}">${转义文本(数据.来源.标签)}</button>`;
        })
            .join('');
        标签区.querySelectorAll(`.${根标识}-tab`).forEach(按钮 => {
            按钮.addEventListener('click', () => {
                当前标签 = 按钮.getAttribute('data-tab') || 当前标签;
                渲染标签();
                渲染列表();
            });
        });
    }
    function 渲染列表() {
        if (!列表区)
            return;
        列表区.innerHTML = '';
        const 数据 = 当前数据们.find(项 => 项.来源.标签 === 当前标签) ?? 当前数据们[0];
        const 选项们 = 数据?.选项 ?? [];
        if (!选项们.length) {
            const 空 = 父文档().createElement('div');
            空.className = `${根标识}-empty`;
            空.textContent = '暂无可选分支';
            列表区.appendChild(空);
            return;
        }
        const 文档 = 父文档();
        选项们.forEach(选项 => {
            const 行 = 文档.createElement('div');
            行.className = `${根标识}-row`;
            行.dataset.tone = 判定配色(选项.内容);
            const 发送 = 文档.createElement('button');
            发送.type = 'button';
            发送.className = `${根标识}-send`;
            发送.innerHTML = `<span class="${根标识}-tag">${转义文本(选项.标签)}</span><span class="${根标识}-text"></span>`;
            发送.querySelector(`.${根标识}-text`).textContent = 选项.内容;
            发送.addEventListener('click', () => {
                行.dataset.picked = '1';
                发送直发(选项.内容);
            });
            const 填入 = 文档.createElement('button');
            填入.type = 'button';
            填入.className = `${根标识}-fill`;
            填入.title = '填入输入框';
            填入.innerHTML = 图标.笔;
            填入.addEventListener('click', 事件 => {
                事件.stopPropagation();
                填入输入框(选项.内容);
            });
            行.appendChild(发送);
            行.appendChild(填入);
            列表区.appendChild(行);
        });
    }
    function 转义命令(文本) {
        return 文本.replace(/(\\+)?([|{}])/g, (_匹配, 斜杠, 字符) => {
            const 前缀 = 斜杠 || '';
            return `${前缀}${前缀}\\${字符}`;
        });
    }
    async function 发送直发(内容) {
        const 安全 = 转义命令(内容);
        try {
            await triggerSlash(`/send ${安全} | /trigger`);
        }
        catch (错误) {
            console.error('[悬浮选项栏] 发送失败：', 错误);
            弹提示('发送失败，请检查酒馆是否正在生成', 'error');
        }
    }
    async function 填入输入框(内容) {
        const 安全 = 转义命令(内容);
        try {
            await triggerSlash(`/setinput ${安全}`);
            弹提示('已填入输入框', 'info');
        }
        catch (错误) {
            console.error('[悬浮选项栏] 填入失败：', 错误);
            弹提示('填入失败', 'error');
        }
    }
    let 上次指纹 = '';
    function 同步(强制 = false) {
        if (!面板根)
            return;
        更新主题();
        const 新数据 = 读取最新层数据();
        if (新数据.length) {
            const 合并 = 配置.来源
                .map(源 => 新数据.find(数据 => 数据.来源.标签 === 源.标签) ?? 当前数据们.find(数据 => 数据.来源.标签 === 源.标签))
                .filter((数据) => !!数据);
            const 指纹 = 合并
                .map(数据 => `${数据.楼层}|${数据.来源.标签}|${数据.选项.map(项 => `${项.标签}:${项.内容}`).join('|')}`)
                .join('‖');
            if (强制 || 指纹 !== 上次指纹) {
                上次指纹 = 指纹;
                当前数据们 = 合并;
                if (!合并.some(数据 => 数据.来源.标签 === 当前标签)) {
                    当前标签 = 合并[0].来源.标签;
                }
                渲染标签();
                渲染列表();
            }
            面板根.hidden = false;
        }
        else if (!当前数据们.length) {
            面板根.hidden = true;
        }
        隐藏楼层块();
    }
    let 防抖定时 = null;
    function 排程同步(延迟 = 260) {
        if (!仍是当前实例())
            return;
        if (防抖定时 !== null)
            clearTimeout(防抖定时);
        防抖定时 = setTimeout(() => {
            防抖定时 = null;
            if (仍是当前实例())
                同步();
        }, 延迟);
    }
    function 绑定事件() {
        const 加 = (事件名, 回调) => {
            try {
                eventOn(事件名, 回调);
            }
            catch (错误) {
                console.debug('[悬浮选项栏] 监听失败：', 事件名, 错误);
            }
        };
        const 全量 = () => {
            上次指纹 = '';
            排程同步(120);
        };
        加('character_message_rendered', () => 排程同步(360));
        加('user_message_rendered', () => 排程同步(220));
        加('message_swiped', 全量);
        加('message_edited', 全量);
        加('message_updated', 全量);
        加('message_deleted', 全量);
        加('chat_id_changed', 全量);
        加('generation_ended', () => 排程同步(500));
        加('generation_stopped', () => 排程同步(500));
        加('message_iframe_render_ended', () => 排程同步(320));
        const 文档 = 父文档();
        const 监听 = new MutationObserver(() => 排程同步(400));
        监听.observe(文档.body, { childList: true, subtree: true });
        window.__moyuFcObserver = 监听;
        const 主题监听 = new MutationObserver(() => 更新主题());
        主题监听.observe(文档.body, { attributes: true, attributeFilter: ['class'] });
        window.__moyuFcThemeObserver = 主题监听;
        const 视窗 = 文档.defaultView;
        if (视窗) {
            const 尺寸变化 = () => 请求动画帧夹紧();
            视窗.addEventListener('resize', 尺寸变化);
            视窗.addEventListener('orientationchange', () => setTimeout(请求动画帧夹紧, 240));
            视窗.visualViewport?.addEventListener('resize', 尺寸变化);
            window.__moyuFcResize = 尺寸变化;
        }
    }
    function 卸载() {
        try {
            window.__moyuFcObserver?.disconnect();
            window.__moyuFcThemeObserver?.disconnect();
        }
        catch {
        }
        try {
            const 视窗 = 父文档().defaultView;
            if (视窗 && window.__moyuFcResize) {
                视窗.removeEventListener('resize', window.__moyuFcResize);
                视窗.visualViewport?.removeEventListener('resize', window.__moyuFcResize);
            }
        }
        catch {
        }
        if (防抖定时 !== null)
            clearTimeout(防抖定时);
        还原楼层块();
        const 文档 = 父文档();
        文档.getElementById(根标识)?.remove();
        文档.getElementById(`${根标识}-style`)?.remove();
        面板根 = null;
    }
    function 等待酒馆就绪(回调) {
        let 次数 = 0;
        const 检查 = () => {
            次数 += 1;
            if (父文档().querySelector('#chat') || 次数 > 120) {
                回调();
                return;
            }
            setTimeout(检查, 250);
        };
        检查();
    }
    $(() => {
        等待酒馆就绪(() => {
            if (!仍是当前实例())
                return;
            try {
                建界面();
                绑定事件();
                同步(true);
                setTimeout(() => { if (仍是当前实例()) 同步(); }, 800);
                setTimeout(() => { if (仍是当前实例()) 同步(); }, 2000);
                console.log('[悬浮选项栏] 已启动');
            }
            catch (错误) {
                console.error('[悬浮选项栏] 启动失败：', 错误);
            }
        });
        window.addEventListener('pagehide', 卸载);
    });
})();