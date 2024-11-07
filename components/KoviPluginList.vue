<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import TOML from "@ltd/j-toml";
import { defineComponent } from "vue";
defineComponent({
    name: "FxemojiDocumenttextpicture",
});

const loadingTexts = [
    "加载中...",
    "请耐心等待...",
    "让我找找看...",
    "或许需要一点时间...",
    "马上就好...",
    "插件在哪里呢...",
    "或许真的出了什么事？",
    "或许真的出了什么事？刷新一下吧？",
];

const currentLoadingText = ref(loadingTexts[0]);

const rotateLoadingText = () => {
    let currentIndex = 0;
    return setInterval(() => {
        if (currentIndex < loadingTexts.length - 1) {
            currentIndex++;
            currentLoadingText.value = loadingTexts[currentIndex];
        }
    }, 8000);
};

let loadingInterval: NodeJS.Timeout;

onMounted(() => {
    // 开始轮换loading文本
    loadingInterval = rotateLoadingText();
});

onUnmounted(() => {
    // 清理interval
    if (loadingInterval) {
        clearInterval(loadingInterval);
    }
});

const isMobile = ref(false);

onMounted(() => {
    const checkMobile = () => {
        isMobile.value = window.innerWidth <= 768;
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    onUnmounted(() => {
        window.removeEventListener("resize", checkMobile);
    });
});

const toggleCopyBox = (plugin: Plugin) => {
    if (isMobile.value) {
        plugin.showCopyBox = !plugin.showCopyBox;
    }
};

interface TomlGitPlugin {
    type: "git";
    shop_name?: string;
    plugin_type: "normal" | "expand";
    package_name: string;
    description: string;
    git_url: string;
    repository: string;
    documentation?: string;
    author_name: string;
    author_url?: string;
    avatar_url?: string;
}

interface TomlCratesIoPlugin {
    type: "crates.io";
    shop_name?: string;
    plugin_type: "normal" | "expand";
    package_name: string;
    description: string;
    repository?: string;
    documentation?: string;
    author_name?: string;
    author_url?: string;
    avatar_url?: string;
}

interface TomlGitPluginMap {
    [key: string]: TomlGitPlugin;
}
interface TomlCratesIoPluginMap {
    [key: string]: TomlCratesIoPlugin;
}
interface Plugins {
    git: TomlGitPluginMap;
    crates_io: TomlCratesIoPluginMap;
}

interface TempPlugin {
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

interface TempPluginMap {
    [key: string]: TempPlugin;
}

const loadTomlfile = async (): Promise<Plugins> => {
    const pluginList: Plugins = {
        git: {} as TomlGitPluginMap,
        crates_io: {} as TomlCratesIoPluginMap,
    };

    try {
        const response = await fetch("/plugin_list.toml");
        const text = await response.text();

        const jsomMapList = TOML.parse(text) as unknown as TempPluginMap;

        for (const [key, plugin] of Object.entries(jsomMapList)) {
            if (plugin.type === "git") {
                if (!plugin.plugin_type) {
                    plugin.plugin_type = "normal";
                }
                pluginList.git[key] = plugin as TomlGitPlugin;
            } else if (plugin.type === "crates.io") {
                if (!plugin.plugin_type) {
                    plugin.plugin_type = "normal";
                }
                pluginList.crates_io[key] = plugin as TomlCratesIoPlugin;
            }
        }
    } catch (error) {
        console.error("Failed to fetch plugins:", error);
    }

    return pluginList;
};

const checkAndInitCratesIoPlugins = async (
    plugins: Plugins
): Promise<Plugins> => {
    for (const [_, plugin] of Object.entries(plugins.crates_io)) {
        if (!plugin.author_name) {
            const { name, url, avatar } = await fetchPluginAuthor(
                plugin.package_name
            );
            if (!plugin.author_name) {
                plugin.author_name = name;
            }

            if (!plugin.author_url) {
                plugin.author_url = url;
            }

            if (!plugin.avatar_url) {
                plugin.avatar_url = avatar;
            }
        }
    }
    return plugins;
};

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
    showCopyBox: boolean;
    copyStatus: "default" | "copied";
    copyTimeout?: number;
}

const plugins = ref<Plugin[]>([]);
const loading = ref<boolean>(true);

const init = async () => {
    const tomlPlugins = await loadTomlfile();
    const pluginsWithAuthors = await checkAndInitCratesIoPlugins(tomlPlugins);
    const pluginArray: Plugin[] = [
        ...Object.entries(pluginsWithAuthors.git).map(
            ([id, plugin]): Plugin => ({
                id,
                type: plugin.type,
                shop_name: plugin.shop_name ? plugin.shop_name : id,
                plugin_type: plugin.plugin_type,
                package_name: plugin.package_name,
                git_url: plugin.git_url,
                description: plugin.description,
                repository: plugin.repository,
                documentation: plugin.documentation,
                author_name: plugin.author_name,
                author_url: plugin.author_url,
                avatar_url: plugin.avatar_url,
                showCopyBox: false,
                copyStatus: "default",
            })
        ),
        ...Object.entries(pluginsWithAuthors.crates_io).map(
            ([id, plugin]): Plugin => ({
                id,
                type: plugin.type,
                shop_name: plugin.shop_name ? plugin.shop_name : id,
                plugin_type: plugin.plugin_type,
                package_name: plugin.package_name,

                description: plugin.description,
                repository: plugin.repository,
                documentation: plugin.documentation,
                author_name: plugin.author_name,
                author_url: plugin.author_url,
                avatar_url: plugin.avatar_url,
                showCopyBox: false,
                copyStatus: "default",
            })
        ),
    ];

    //官方
    const officialPlugins = pluginArray.filter((plugin) =>
        authorIsAuthor(plugin.author_name)
    );
    //非官方
    const nonOfficialPlugins = pluginArray.filter(
        (plugin) => !authorIsAuthor(plugin.author_name)
    );

    // 随机打乱
    for (let i = officialPlugins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [officialPlugins[i], officialPlugins[j]] = [
            officialPlugins[j],
            officialPlugins[i],
        ];
    }

    // 随机打乱
    for (let i = nonOfficialPlugins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonOfficialPlugins[i], nonOfficialPlugins[j]] = [
            nonOfficialPlugins[j],
            nonOfficialPlugins[i],
        ];
    }

    // 合并
    plugins.value = [...officialPlugins, ...nonOfficialPlugins];

    //清理时间计时器;
    if (loadingInterval) {
        clearInterval(loadingInterval);
    }
    //停止加载画面
    loading.value = false;
};

const fetchPluginAuthor = async (
    pluginName: string
): Promise<{
    name: string | undefined;
    url: string | undefined;
    avatar: string | undefined;
}> => {
    try {
        const response = await axios.get(
            `https://crates.io/api/v1/crates/${pluginName}/owner_user`
        );

        return {
            name: response.data.users[0]?.name || undefined,
            url: response.data.users[0]?.url || undefined,
            avatar: response.data.users[0]?.avatar || undefined,
        };
    } catch (error) {
        console.error(`Failed to fetch author for ${pluginName}:`, error);
        return { name: undefined, url: undefined, avatar: undefined };
    }
};

const formatPluginName = (name: string): string => {
    return name.replace(/^kovi-plugin-/, "");
};

const formatTextLen = (description: string, len: number): string => {
    return description.length > len
        ? description.slice(0, len) + "..."
        : description;
};

const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const authorIsAuthor = (name: string | undefined): boolean => {
    if (name === undefined) {
        return false;
    }

    return name === "三瓶可乐不过岗" || name.toLowerCase() === "threkork";
};

const copyToClipboard = (plugin: Plugin): void => {
    let cmd: string;

    if (plugin.type === "git") {
        cmd = `cargo add --git ${plugin.git_url} ${plugin.package_name}`;
    } else if (plugin.type === "crates.io" && plugin.plugin_type === "expand") {
        cmd = `cargo kovi add ${formatPluginName(plugin.package_name)} -p `;
    } else {
        cmd = `cargo kovi add ${formatPluginName(plugin.package_name)}`;
    }

    navigator.clipboard.writeText(cmd).then(() => {
        plugin.copyStatus = "copied";

        if (plugin.copyTimeout) {
            clearTimeout(plugin.copyTimeout);
        }
        plugin.copyTimeout = window.setTimeout(() => {
            plugin.copyStatus = "default";
        }, 3000);
    });
};

const goCratesIoToLink = (plugin: Plugin): void => {
    if (plugin.package_name) {
        const link = `https://crates.io/crates/${plugin.package_name}`;
        window.open(link, "_blank");
    }
};

const goToLink = (url: any): void => {
    if (!url) {
        return;
    }
    window.open(url, "_blank");
};

onMounted(init);
</script>

<template>
    <div class="plugins-main">
        <div v-if="loading" class="loading-container">
            <Transition>
                <h3>{{ currentLoadingText }}</h3>
            </Transition>
        </div>
        <div v-else class="plugin-list">
            <div
                v-for="plugin in plugins"
                :key="plugin.id"
                class="plugin-card brackground"
                @mouseover="!isMobile && (plugin.showCopyBox = true)"
                @mouseleave="!isMobile && (plugin.showCopyBox = false)"
                @click="toggleCopyBox(plugin)"
            >
                <div>
                    <div class="plugin-card-box">
                        <div class="plugin-header">
                            <div class="plugins-h2">
                                {{ plugin.shop_name }}
                            </div>
                        </div>
                        <p class="description">
                            {{ formatTextLen(plugin.description, 50) }}
                        </p>
                    </div>
                    <div class="card-footer">
                        <div class="label">
                            <span
                                class="badge"
                                v-if="authorIsAuthor(plugin.author_name)"
                                >官方</span
                            >
                            <span class="plugin-type">{{ plugin.type }}</span>
                        </div>

                        <div style="display: flex; align-items: center">
                            <img
                                v-if="plugin.avatar_url"
                                :src="plugin.avatar_url"
                                class="avatar"
                            />
                            <img
                                v-else
                                src="https://ga.viki.moe/avatar/?d=mp"
                                class="avatar"
                            />
                            <p class="author" v-if="plugin.author_name">
                                {{ plugin.author_name }}
                            </p>
                            <p class="author" v-else>Unknown Author</p>
                        </div>
                    </div>
                </div>

                <!-- @click="goToLink(plugin)" -->
                <Transition
                    name="copy-box"
                    @click="isMobile && toggleCopyBox(plugin)"
                >
                    <div
                        v-show="plugin.showCopyBox"
                        class="copy-box"
                        @click.stop
                    >
                        <div class="plugin-header">
                            <div class="plugins-h2">
                                {{ plugin.shop_name }}
                            </div>
                        </div>
                        <div class="link-button">
                            <button
                                class="brackground"
                                @click.stop="copyToClipboard(plugin)"
                            >
                                {{
                                    plugin.copyStatus === "copied"
                                        ? "已复制"
                                        : "复制添加命令"
                                }}
                            </button>
                            <button
                                v-if="plugin.type === 'crates.io'"
                                @click.stop="goCratesIoToLink(plugin)"
                            >
                                <img
                                    src="https://crates.io/assets/cargo.png"
                                    alt="crates.io"
                                />
                                <p>crates.io</p>
                            </button>

                            <button
                                v-if="plugin.repository"
                                @click.stop="goToLink(plugin.repository)"
                            >
                                <img
                                    src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png"
                                    alt="git"
                                />
                                <p>仓库</p>
                            </button>

                            <button
                                v-if="plugin.documentation"
                                @click.stop="goToLink(plugin.documentation)"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 512 512"
                                >
                                    <path
                                        fill="#dce2e2"
                                        d="M433.694 507.594H78.306c-11.929 0-21.6-9.671-21.6-21.6V25.317c0-11.929 9.671-21.6 21.6-21.6h263.026l113.961 112.739v369.538c.001 11.929-9.67 21.6-21.599 21.6"
                                    />
                                    <path
                                        fill="#96a9b2"
                                        d="M298.976 79.728h-74.642a7.904 7.904 0 0 1 0-15.808h74.642a7.904 7.904 0 0 1 0 15.808m-20.594 46.49a7.904 7.904 0 0 0-7.904-7.904h-46.144a7.904 7.904 0 0 0 0 15.808h46.144a7.904 7.904 0 0 0 7.904-7.904m116.577 54.394a7.904 7.904 0 0 0-7.904-7.904H224.333a7.904 7.904 0 0 0 0 15.808h162.721a7.905 7.905 0 0 0 7.905-7.904m-17.603 54.393a7.904 7.904 0 0 0-7.904-7.904H106.557a7.904 7.904 0 0 0 0 15.808h262.896a7.903 7.903 0 0 0 7.903-7.904M271.69 289.399a7.904 7.904 0 0 0-7.904-7.904H106.557a7.904 7.904 0 0 0 0 15.808h157.229a7.903 7.903 0 0 0 7.904-7.904m123.269 54.394a7.904 7.904 0 0 0-7.904-7.904H106.557a7.904 7.904 0 0 0 0 15.808h280.498a7.904 7.904 0 0 0 7.904-7.904m0 54.394a7.904 7.904 0 0 0-7.904-7.904H106.557a7.904 7.904 0 0 0 0 15.808h280.498a7.904 7.904 0 0 0 7.904-7.904m0 54.393a7.904 7.904 0 0 0-7.904-7.904H106.557a7.904 7.904 0 0 0 0 15.808h280.498a7.904 7.904 0 0 0 7.904-7.904"
                                    />
                                    <path
                                        fill="#b9c5c6"
                                        d="m341.333 3.717l112.739 112.739h-88.776c-13.235 0-23.963-10.729-23.963-23.963z"
                                    />
                                    <path
                                        fill="#00b1ff"
                                        d="M106.207 64.821h84.582a8.13 8.13 0 0 1 8.127 8.127v106.54a8.13 8.13 0 0 1-8.127 8.127h-84.582a8.13 8.13 0 0 1-8.127-8.127V72.948a8.13 8.13 0 0 1 8.127-8.127"
                                    />
                                </svg>
                                <p>文档</p>
                            </button>

                            <button
                                v-if="plugin.author_url"
                                @click.stop="goToLink(plugin.author_url)"
                            >
                                <img
                                    v-if="plugin.avatar_url"
                                    :src="plugin.avatar_url"
                                    class="avatar"
                                />
                                <img
                                    v-else
                                    src="https://ga.viki.moe/avatar/?d=mp"
                                    class="avatar"
                                />
                                <p v-if="plugin.author_name">
                                    {{ plugin.author_name }}
                                </p>
                                <p v-else>Unknown Author</p>
                            </button>
                        </div>

                        <!-- <div class="copy-box-footer"></div> -->
                    </div>
                </Transition>
            </div>
        </div>
    </div>
</template>

<style>
.loading-container {
    text-align: center;
    padding: 20px;
}

.loading-container h3 {
    transition: opacity 0.3s ease;
}

.copy-box-enter-active,
.copy-box-leave-active {
    transition: opacity 0.3s ease;
}

.copy-box-enter-from,
.copy-box-leave-to {
    opacity: 0;
}

.plugins-h2 {
    font-weight: 700;
    font-size: 24px;
    color: var(--vp-c-text-1);
}

.plugins-main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.plugin-list {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    gap: 16px;
}

.plugin-card {
    position: relative;
    border-radius: 12px;
    box-sizing: border-box;
    border: 1px solid var(--vp-c-divider);
    height: 165px;
    width: 330px;
    transition: all 0.3s;
    word-break: break-all;
}

.plugin-card:hover {
    border: 1px solid var(--vp-c-brand-1);
}

.plugin-card p {
    margin: 0;
    font-weight: 500;
    font-size: 16px;
    color: var(--vp-c-text-1);
}

.plugin-card-box {
    padding: 16px;
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    cursor: pointer;
}

.plugin-header {
    padding: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    word-break: break-all;
}

.label {
    position: static; /* 改为static而不是absolute */
    display: flex;
    align-items: center;
    flex-direction: row;
    min-width: 0; /* 移除最小宽度限制 */
    text-align: left; /* 左对齐文本 */
    font-size: 14px;
    color: var(--vp-c-text-1);
}

.badge {
    display: inline-flex;
    align-items: center;
    background-color: #ffcfcf;
    border-radius: 4px;
    padding: 2px 8px;
    margin-right: 4px;
    max-height: 26px;
}

:root.dark .badge {
    background-color: #383d53;
    color: var(--vp-code-color);
}

.plugin-type {
    display: inline-flex;
    align-items: center;
    background-color: #eff0f3;
    border-radius: 4px;
    padding: 2px 8px;
    max-height: 26px;
}

:root.dark .plugin-type {
    background-color: #272a2f;
    color: var(--vp-code-color);
}

.description {
    min-height: 100px;
    margin: 0;
    color: #515151;
}

.card-footer {
    margin: 0 16px 6px 16px;
    color: #858585;
    position: absolute;
    font-size: 14px;
    display: flex;
    justify-content: space-between; /* 这确保了子元素之间的最大间距 */
    align-items: center;
    bottom: 0;
    width: calc(100% - 32px);
}

.card-footer > div:last-child {
    display: flex;
    align-items: center;
    justify-content: flex-end; /* 确保右对齐 */
}

.description {
    min-height: 100px;
    margin: 0;
    color: #515151;
}

.card-footer {
    margin: 0 16px 6px 16px;
    color: #858585;
    position: absolute;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    bottom: 0;
    width: calc(100% - 32px);
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin: 0 8px 0 8px;
}

.author {
    max-width: 190px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #858585;
}

.copy-box {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgb(255, 255, 255);

    color: var(--vp-c-text-1);
    padding: 16px;
    border-radius: 12px;
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
    overflow: hidden; /* 隐藏溢出内容 */
}
/*
    display: flex;
    flex-direction: column;
    justify-content: space-between;
*/

:root.dark .copy-box {
    background-color: rgb(27, 27, 31);
    color: #ffffff;
}

.copy-box-footer {
    position: absolute;
    bottom: 12px;
    width: calc(100% - 32px);
    display: flex;
    justify-content: flex-end;
    pointer-events: none;
}
.copy-box-footer button {
    pointer-events: auto;
}

.copy-box p {
    margin: 0;
    font-weight: 500;
    font-size: 16px;
    color: #515151;
    line-height: 20px;
    word-break: keep-all;
}

:root.dark .copy-box p {
    color: var(--vp-c-text-1);
}

.copy-box button {
    border: none;
    padding: 4px 8px;
    border: 1px solid #eeeeee;
    border-radius: 8px;
    cursor: pointer;
    color: var(--vp-c-brand-1);
    font-weight: 500;
    font-size: 14px;
    width: 70px;
}

.copy-box button:hover {
    border: 1px solid var(--vp-c-brand-1);
    transition: all 0.3s;
}

.link-button {
    padding: 0px 8px 0px 8px;
    transform: translateY(8px);
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    row-gap: 8px;
    justify-content: space-between;

    overflow-y: auto;
    max-height: calc(100% - 30px);
    padding-right: 12px;
}

.link-button button {
    width: 130px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 12px;
}

.link-button button img {
    width: 30px;
    height: 30px;
    object-fit: contain;
    margin: 0;
}

.link-button button svg {
    width: 30px;
    height: 30px;
    object-fit: contain;
    margin: 0;
}

.link-button button p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transform: translateY(-1px);
    width: 60px;
    text-align: left;
    color: var(--vp-c-brand-1);
    font-weight: 500;
    font-size: 14px;
}
:root.dark .link-button button {
    color: var(--vp-c-text-1);
}

:root.dark .copy-box button {
    border: 1px solid #2e2e32;
}

:root.dark .copy-box button:hover {
    border: 1px solid var(--vp-c-brand-1);
    transition: all 0.3s;
}

:root.dark .brackground {
    background-color: #1b1b1f;
}
.brackground {
    background-color: #fff;
}
</style>
