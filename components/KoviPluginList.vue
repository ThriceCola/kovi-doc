<!-- KoviPluginList.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import axios from "axios";
import TOML from "@ltd/j-toml";

// --- 接口定义 ---

interface Plugin {
    id: string;
    type: "crates.io" | "git";
    shop_name: string;
    plugin_type: "normal" | "expand";
    package_name: string;
    git_url?: string;
    description: string;
    repository?: string;
    documentation?: string;
    author_name?: string;
    author_url?: string;
    avatar_url?: string;

    // 状态控制
    showCopyBox: boolean;
    copyStatus: "default" | "copied";
    copyTimeout?: number;
}

// TOML 解析用的临时接口
interface TomlPluginRaw {
    type: "git" | "crates.io";
    shop_name?: string;
    plugin_type?: "normal" | "expand";
    package_name: string;
    description?: string;
    git_url?: string;
    repository?: string;
    documentation?: string;
    author_name?: string;
    author_url?: string;
    avatar_url?: string;
}

interface TomlMap {
    [key: string]: TomlPluginRaw;
}

// --- 状态管理 ---

const plugins = ref<Plugin[]>([]);
const loading = ref<boolean>(true);
const isMobile = ref(false);
const listTopRef = ref<HTMLElement | null>(null);

// 搜索与分页
const searchQuery = ref("");
const currentCategory = ref("all");
const currentPage = ref(1);
const pageSize = 12; // 每页显示数量

// --- 加载文案轮播 ---
const loadingTexts = [
    "正在连接插件市场...",
    "正在读取 TOML 索引...",
    "正在从 Crates.io 获取元数据...",
    "稍等片刻，马上就好...",
    "加载中...",
];
const currentLoadingText = ref(loadingTexts[0]);

// --- 核心逻辑 ---

// 1. 分类配置 (易于拓展)
const categories = [
    { key: "all", label: "全部" },
    { key: "official", label: "官方推荐" },
    { key: "community", label: "社区贡献" },
    { key: "expand", label: "API 拓展" },
    { key: "crates", label: "Crates.io" },
    { key: "git", label: "Git 仓库" },
];

const officialAuthors = ["三瓶可乐不过岗", "threkork", "thricecola"];

const isOfficial = (author?: string) => {
    return author ? officialAuthors.includes(author) : false;
};

// 2. 过滤逻辑 (搜索 + 分类)
const filteredPlugins = computed(() => {
    let result = plugins.value;

    // 分类筛选
    if (currentCategory.value !== "all") {
        result = result.filter((p) => {
            switch (currentCategory.value) {
                case "official":
                    return isOfficial(p.author_name);
                case "community":
                    return !isOfficial(p.author_name);
                case "expand":
                    return p.plugin_type === "expand";
                case "crates":
                    return p.type === "crates.io";
                case "git":
                    return p.type === "git";
                default:
                    return true;
            }
        });
    }

    // 搜索筛选
    const query = searchQuery.value.toLowerCase().trim();
    if (query) {
        result = result.filter(
            (p) =>
                p.shop_name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                (p.author_name &&
                    p.author_name.toLowerCase().includes(query)) ||
                p.package_name.toLowerCase().includes(query)
        );
    }

    return result;
});

// 3. 分页逻辑
const totalPages = computed(() =>
    Math.ceil(filteredPlugins.value.length / pageSize)
);

const paginatedPlugins = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredPlugins.value.slice(start, end);
});

// 监听筛选条件变化，重置页码
watch([searchQuery, currentCategory], () => {
    currentPage.value = 1;
});

// 翻页操作
const changePage = (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;

    // 滚动到列表顶部
    nextTick(() => {
        if (listTopRef.value) {
            const top =
                listTopRef.value.getBoundingClientRect().top +
                window.scrollY -
                100; // 减去头部导航栏高度偏移
            window.scrollTo({ top, behavior: "smooth" });
        }
    });
};

// --- 数据获取与初始化 ---

const loadTomlfile = async (): Promise<Plugin[]> => {
    try {
        const response = await fetch("/plugin_list.toml");
        const text = await response.text();
        const rawMap = TOML.parse(text) as unknown as TomlMap;
        const list: Plugin[] = [];

        for (const [key, raw] of Object.entries(rawMap)) {
            list.push({
                id: key,
                type: raw.type,
                shop_name: raw.shop_name || key,
                plugin_type: raw.plugin_type || "normal",
                package_name: raw.package_name,
                description: raw.description || "暂无描述",
                git_url: raw.git_url,
                repository: raw.repository,
                documentation: raw.documentation,
                author_name: raw.author_name,
                author_url: raw.author_url,
                avatar_url: raw.avatar_url,
                showCopyBox: false,
                copyStatus: "default",
            });
        }
        return list;
    } catch (error) {
        console.error("加载插件列表失败:", error);
        currentLoadingText.value = "加载列表失败，请检查网络或配置。";
        return [];
    }
};

// 异步获取 Crates.io 信息 (不阻塞页面渲染)
const fetchMetadataAsync = async (pluginList: Plugin[]) => {
    const tasks = pluginList.map(async (plugin) => {
        if (
            plugin.type === "crates.io" &&
            (!plugin.author_name || !plugin.avatar_url)
        ) {
            try {
                const res = await axios.get(
                    `https://crates.io/api/v1/crates/${plugin.package_name}/owner_user`
                );
                const user = res.data.users[0];
                if (user) {
                    if (!plugin.author_name) plugin.author_name = user.name;
                    if (!plugin.author_url) plugin.author_url = user.url;
                    if (!plugin.avatar_url) plugin.avatar_url = user.avatar;
                }
            } catch (e) {
                // 忽略单个失败，不影响整体
            }
        }
    });
    // 这里不 await all，让它们在后台慢慢加载，Vue 的响应式会自动更新 UI
    await Promise.allSettled(tasks);
};

const init = async () => {
    // 1. 移动端检测
    const checkMobile = () => (isMobile.value = window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // 2. 轮播 Loading 文字
    let textIndex = 0;
    const textInterval = setInterval(() => {
        textIndex = (textIndex + 1) % loadingTexts.length;
        currentLoadingText.value = loadingTexts[textIndex];
    }, 2000);

    // 3. 加载基础数据
    const loadedPlugins = await loadTomlfile();

    // 4. 随机打乱 (仅在初始化时打乱一次，保证后续分页/搜索顺序稳定)
    // 分离官方和非官方，分别打乱后再合并，保证官方尽量靠前（可选策略，这里沿用原逻辑）
    const official = loadedPlugins.filter((p) => isOfficial(p.author_name));
    const other = loadedPlugins.filter((p) => !isOfficial(p.author_name));

    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
    plugins.value = [...shuffle(official), ...shuffle(other)];

    loading.value = false;
    clearInterval(textInterval);

    // 5. 后台静默加载详细信息
    fetchMetadataAsync(plugins.value);

    // 清理
    onUnmounted(() => {
        window.removeEventListener("resize", checkMobile);
        clearInterval(textInterval);
    });
};

onMounted(init);

// --- 交互功能 ---

const formatPluginName = (name: string) => name.replace(/^kovi-plugin-/, "");

const copyToClipboard = (plugin: Plugin) => {
    let cmd = "";
    if (plugin.type === "git" && plugin.git_url) {
        cmd = `cargo add --git ${plugin.git_url} ${plugin.package_name}`;
    } else if (plugin.type === "crates.io" && plugin.plugin_type === "expand") {
        cmd = `cargo kovi add ${formatPluginName(plugin.package_name)} -p`;
    } else {
        cmd = `cargo kovi add ${formatPluginName(plugin.package_name)}`;
    }

    navigator.clipboard.writeText(cmd).then(() => {
        plugin.copyStatus = "copied";
        if (plugin.copyTimeout) clearTimeout(plugin.copyTimeout);
        plugin.copyTimeout = window.setTimeout(() => {
            plugin.copyStatus = "default";
        }, 2000);
    });
};

const openLink = (url?: string) => {
    if (url) window.open(url, "_blank");
};

const goCratesIo = (plugin: Plugin) => {
    openLink(`https://crates.io/crates/${plugin.package_name}`);
};

const toggleCard = (plugin: Plugin) => {
    if (isMobile.value) {
        plugin.showCopyBox = !plugin.showCopyBox;
    }
};
</script>

<template>
    <div class="market-container">
        <!-- 头部搜索与过滤区 -->
        <div class="filter-section">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索插件、作者或描述..."
                    class="search-input"
                />
                <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="clear-btn"
                >
                    ✕
                </button>
            </div>

            <div class="category-tabs">
                <button
                    v-for="cat in categories"
                    :key="cat.key"
                    :class="[
                        'tab-btn',
                        { active: currentCategory === cat.key },
                    ]"
                    @click="currentCategory = cat.key"
                >
                    {{ cat.label }}
                </button>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>{{ currentLoadingText }}</p>
        </div>

        <!-- 主列表区 -->
        <div v-else class="content-area" ref="listTopRef">
            <!-- 列表为空 -->
            <div v-if="filteredPlugins.length === 0" class="empty-state">
                <p>没有找到相关插件 🍃</p>
                <button
                    @click="
                        searchQuery = '';
                        currentCategory = 'all';
                    "
                    class="reset-btn"
                >
                    重置筛选
                </button>
            </div>

            <!-- 插件网格 -->
            <div v-else>
                <!-- 顶部简易分页 (仅当页数多时显示) -->
                <div v-if="totalPages > 1" class="pagination-mini">
                    <span
                        >第 {{ currentPage }} / {{ totalPages }} 页 (共
                        {{ filteredPlugins.length }} 个)</span
                    >
                </div>

                <div class="plugin-grid">
                    <div
                        v-for="plugin in paginatedPlugins"
                        :key="plugin.id"
                        class="plugin-card"
                        :class="{ 'show-overlay': plugin.showCopyBox }"
                        @mouseenter="!isMobile && (plugin.showCopyBox = true)"
                        @mouseleave="!isMobile && (plugin.showCopyBox = false)"
                        @click="toggleCard(plugin)"
                    >
                        <!-- 卡片内容正面 -->
                        <div class="card-content">
                            <div class="card-header">
                                <h3 class="plugin-name">
                                    {{ plugin.shop_name }}
                                </h3>
                                <div class="badges">
                                    <span
                                        v-if="isOfficial(plugin.author_name)"
                                        class="badge official"
                                        >官方</span
                                    >
                                    <span
                                        v-if="plugin.plugin_type === 'expand'"
                                        class="badge expand"
                                        >拓展</span
                                    >
                                    <span class="badge type">{{
                                        plugin.type === "git" ? "Git" : "Crate"
                                    }}</span>
                                </div>
                            </div>

                            <p class="plugin-desc" :title="plugin.description">
                                {{ plugin.description }}
                            </p>

                            <div class="card-footer">
                                <div class="author-info">
                                    <img
                                        :src="
                                            plugin.avatar_url ||
                                            'https://ga.viki.moe/avatar/?d=mp'
                                        "
                                        class="avatar"
                                        loading="lazy"
                                    />
                                    <span class="author-name">{{
                                        plugin.author_name || "加载中..."
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 交互遮罩层 (悬浮/点击显示) -->
                        <div class="card-overlay">
                            <h3 class="overlay-title">
                                {{ plugin.shop_name }}
                            </h3>

                            <div class="action-buttons">
                                <button
                                    class="action-btn primary"
                                    :class="{
                                        success: plugin.copyStatus === 'copied',
                                    }"
                                    @click.stop="copyToClipboard(plugin)"
                                >
                                    <span class="icon">{{
                                        plugin.copyStatus === "copied"
                                            ? "✓"
                                            : "📋"
                                    }}</span>
                                    {{
                                        plugin.copyStatus === "copied"
                                            ? "命令已复制"
                                            : "复制安装命令"
                                    }}
                                </button>

                                <div class="secondary-actions">
                                    <button
                                        v-if="plugin.type === 'crates.io'"
                                        @click.stop="goCratesIo(plugin)"
                                        class="icon-btn"
                                        title="Crates.io"
                                    >
                                        📦
                                    </button>
                                    <button
                                        v-if="plugin.repository"
                                        @click.stop="
                                            openLink(plugin.repository)
                                        "
                                        class="icon-btn"
                                        title="代码仓库"
                                    >
                                        🐱
                                    </button>
                                    <button
                                        v-if="plugin.documentation"
                                        @click.stop="
                                            openLink(plugin.documentation)
                                        "
                                        class="icon-btn"
                                        title="文档"
                                    >
                                        📖
                                    </button>
                                    <button
                                        v-if="plugin.author_url"
                                        @click.stop="
                                            openLink(plugin.author_url)
                                        "
                                        class="icon-btn"
                                        title="作者主页"
                                    >
                                        👤
                                    </button>
                                </div>
                            </div>

                            <div v-if="isMobile" class="mobile-hint">
                                点击任意处关闭
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部完整分页 -->
                <div class="pagination-container">
                    <button
                        class="page-nav"
                        :disabled="currentPage === 1"
                        @click="changePage(currentPage - 1)"
                    >
                        上一页
                    </button>

                    <div class="page-numbers">
                        <button
                            v-for="p in totalPages"
                            :key="p"
                            class="page-num"
                            :class="{ active: p === currentPage }"
                            @click="changePage(p)"
                            v-show="
                                p === 1 ||
                                p === totalPages ||
                                (p >= currentPage - 1 && p <= currentPage + 1)
                            "
                        >
                            {{ p }}
                        </button>
                    </div>

                    <button
                        class="page-nav"
                        :disabled="currentPage === totalPages"
                        @click="changePage(currentPage + 1)"
                    >
                        下一页
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 容器 */
.market-container {
    padding: 20px 0;
    max-width: 1200px;
    margin: 0 auto;
}

/* 搜索与过滤区 */
.filter-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 40px;
}

.search-box {
    position: relative;
    width: 100%;
    max-width: 500px;
}

.search-input {
    width: 100%;
    padding: 12px 40px;
    border-radius: 24px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-alt);
    color: var(--vp-c-text-1);
    font-size: 16px;
    transition: all 0.3s;
}

.search-input:focus {
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 0 0 4px var(--vp-c-brand-soft);
    outline: none;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.5;
}

.clear-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--vp-c-text-2);
}

.category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
}

.tab-btn {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid transparent;
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-text-2);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-btn:hover {
    background-color: var(--vp-c-bg-mute);
    color: var(--vp-c-text-1);
}

.tab-btn.active {
    background-color: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
    font-weight: 600;
}

/* 加载动画 */
.loading-state {
    text-align: center;
    padding: 60px 0;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--vp-c-bg-soft);
    border-top-color: var(--vp-c-brand-1);
    border-radius: 50%;
    margin: 0 auto 20px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 60px;
    color: var(--vp-c-text-2);
}

.reset-btn {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: var(--vp-c-brand-1);
    color: white;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

/* 插件网格 */
.plugin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

/* 插件卡片 */
.plugin-card {
    position: relative;
    height: 180px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    overflow: hidden;
    transition:
        transform 0.3s,
        box-shadow 0.3s;
    cursor: default;
}

.plugin-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    border-color: var(--vp-c-brand-1);
}

.card-content {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.plugin-name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--vp-c-text-1);
    line-height: 1.3;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
}

.badges {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    margin-left: 8px;
}

.badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
}

.badge.official {
    background-color: rgba(255, 71, 87, 0.15);
    color: #ff4757;
}

.badge.expand {
    background-color: rgba(46, 204, 113, 0.15);
    color: #2ecc71;
}

.badge.type {
    background-color: var(--vp-c-bg-mute);
    color: var(--vp-c-text-2);
}

.plugin-desc {
    font-size: 14px;
    color: var(--vp-c-text-2);
    margin: 0;
    flex-grow: 1;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--vp-c-divider);
}

.author-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
}

.author-name {
    font-size: 12px;
    color: var(--vp-c-text-2);
}

/* 遮罩层 */
.card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--vp-c-bg); /* 实色背景，覆盖下层 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 10;
}

/* 激活遮罩层 */
.plugin-card.show-overlay .card-overlay {
    opacity: 1;
    pointer-events: auto;
}

.overlay-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--vp-c-text-1);
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    align-items: center;
}

.action-btn.primary {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--vp-c-brand-1);
    background-color: transparent;
    color: var(--vp-c-brand-1);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.action-btn.primary:hover {
    background-color: var(--vp-c-brand-1);
    color: white;
}

.action-btn.success {
    background-color: var(--vp-c-green-soft, #e0f2f1);
    color: var(--vp-c-green-1, #009688);
    border-color: var(--vp-c-green-1, #009688);
}

.secondary-actions {
    display: flex;
    gap: 12px;
}

.icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-mute);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s;
}

.icon-btn:hover {
    background-color: var(--vp-c-brand-soft);
    border-color: var(--vp-c-brand-1);
    transform: scale(1.1);
}

.mobile-hint {
    font-size: 12px;
    color: var(--vp-c-text-3);
    margin-top: 10px;
}

/* 分页控件 */
.pagination-mini {
    text-align: right;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--vp-c-text-2);
}

.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
}

.page-nav {
    padding: 8px 16px;
    border-radius: 6px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    color: var(--vp-c-text-1);
    cursor: pointer;
    transition: all 0.2s;
}

.page-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-nav:not(:disabled):hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
}

.page-numbers {
    display: flex;
    gap: 8px;
}

.page-num {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--vp-c-text-2);
    cursor: pointer;
}

.page-num.active {
    background-color: var(--vp-c-brand-1);
    color: white;
    font-weight: bold;
}
</style>
