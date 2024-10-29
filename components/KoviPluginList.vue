<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
// import * as TOML from "@iarna/toml";
import TOML from "@ltd/j-toml";

interface PluginAuthor {
    name: string;
    author_url?: string;
    avatar_url?: string;
}

interface TomlGitPlugin {
    type: "git";
    plugin_type: "normal" | "expand";
    name: string;
    description: string;
    git_url: string;
    repository: string;
    documentation?: string;
    author: PluginAuthor;
}

interface TomlCratesIoPlugin {
    type: "crates.io";
    plugin_type: "normal" | "expand";
    name: string;
    description: string;
    repository?: string;
    documentation?: string;
    author?: PluginAuthor;
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
    name: string;
    description?: string;
    git_url?: string;
    repository?: string;
    documentation?: string;
    author?: PluginAuthor;
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
                pluginList.git[key] = plugin as TomlGitPlugin;
            } else if (plugin.type === "crates.io") {
                pluginList.crates_io[key] =
                    plugin as unknown as TomlCratesIoPlugin;
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
    for (const [key, plugin] of Object.entries(plugins.crates_io)) {
        if (!plugin.author) {
            const { name, url, avatar } = await fetchPluginAuthor(plugin.name);
            if (name) {
                plugins.crates_io[key].author = {
                    name: name.toString(),
                    author_url: url ? url.toString() : undefined,
                    avatar_url: avatar ? avatar.toString() : undefined,
                };
            }
        }
    }
    return plugins;
};

interface Plugin {
    name: string;
    package_name: string;
    type: "crates.io" | "git";
    plugin_type: "normal" | "expand";
    git_url?: string;
    description: string;
    repository?: string;
    documentation?: string;
    author: PluginAuthor;

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
            ([name, plugin]): Plugin => ({
                type: plugin.type,
                package_name: plugin.name,
                plugin_type: plugin.plugin_type,
                name,
                description: plugin.description,
                git_url: plugin.git_url,
                repository: plugin.repository,
                documentation: plugin.documentation,
                author: plugin.author,
                showCopyBox: false,
                copyStatus: "default",
            })
        ),
        ...Object.entries(pluginsWithAuthors.crates_io).map(
            ([name, plugin]): Plugin => ({
                type: plugin.type,
                package_name: plugin.name,
                plugin_type: plugin.plugin_type,
                name: name,
                description: plugin.description,
                repository: plugin.repository,
                documentation: plugin.documentation,
                author: plugin.author!,
                showCopyBox: false,
                copyStatus: "default",
            })
        ),
    ];

    //官方
    const officialPlugins = pluginArray.filter((plugin) =>
        authorIsAuthor(plugin.author)
    );
    //非官方
    const nonOfficialPlugins = pluginArray.filter(
        (plugin) => !authorIsAuthor(plugin.author)
    );

    // 随机打乱非官方插件
    for (let i = nonOfficialPlugins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonOfficialPlugins[i], nonOfficialPlugins[j]] = [
            nonOfficialPlugins[j],
            nonOfficialPlugins[i],
        ];
    }

    // 合并官方插件和打乱后的非官方插件
    plugins.value = [...officialPlugins, ...nonOfficialPlugins];

    loading.value = false;
};

const fetchPluginAuthor = async (
    pluginName: string
): Promise<{
    name: string | null;
    url: string | null;
    avatar: string | null;
}> => {
    try {
        const response = await axios.get(
            `https://crates.io/api/v1/crates/${pluginName}/owner_user`
        );

        return {
            name: response.data.users[0]?.name || null,
            url: response.data.users[0]?.url || null,
            avatar: response.data.users[0]?.avatar || null,
        };
    } catch (error) {
        console.error(`Failed to fetch author for ${pluginName}:`, error);
        return { name: null, url: null, avatar: null };
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

const authorIsAuthor = (author: PluginAuthor): boolean => {
    return (
        author.name === "三瓶可乐不过岗" ||
        author.name.toLowerCase() === "threkork"
    );
};

const copyToClipboard = (plugin: Plugin): void => {
    let cmd: string;

    if (plugin.type === "crates.io" && plugin.plugin_type === "normal") {
        cmd = `cargo kovi add ${formatPluginName(plugin.package_name)}`;
    } else if (plugin.type === "crates.io" && plugin.plugin_type === "expand") {
        cmd = `cargo kovi add ${formatPluginName(plugin.package_name)} -p `;
    } else {
        cmd = `cargo add --git ${plugin.git_url} ${plugin.package_name}`;
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
    if (plugin.name) {
        const link = `https://crates.io/crates/${plugin.name}`;
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
        <div v-if="loading">加载中...</div>
        <div v-else class="plugin-list">
            <div
                v-for="plugin in plugins"
                :key="plugin.name"
                class="plugin-card brackground"
                @mouseover="plugin.showCopyBox = true"
                @mouseleave="plugin.showCopyBox = false"
            >
                <div>
                    <div class="plugin-card-box">
                        <div class="plugin-header">
                            <div class="plugins-h2">
                                {{ plugin.name }}
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
                                v-if="authorIsAuthor(plugin.author)"
                                >官方</span
                            >
                            <span class="plugin-type">{{ plugin.type }}</span>
                        </div>

                        <div style="display: flex; align-items: center">
                            <img
                                v-if="plugin.author.avatar_url"
                                :src="plugin.author.avatar_url"
                                class="avatar"
                            />
                            <img
                                v-else
                                src="https://ga.viki.moe/avatar/?d=mp"
                                class="avatar"
                            />
                            <p class="author" v-if="plugin.author.name">
                                {{ plugin.author.name }}
                            </p>
                            <p class="author" v-else>Unknown Author</p>
                        </div>
                    </div>
                </div>

                <!-- @click="goToLink(plugin)" -->
                <Transition name="copy-box">
                    <div v-show="plugin.showCopyBox" class="copy-box">
                        <div class="plugin-header">
                            <div class="plugins-h2">
                                {{ plugin.name }}
                            </div>
                        </div>
                        <div class="link-button">
                            <button
                                v-if="plugin.type === 'crates.io'"
                                @click="goCratesIoToLink(plugin)"
                            >
                                <img
                                    src="https://crates.io/assets/cargo.png"
                                    alt="crates.io"
                                />
                                <p>crates.io</p>
                            </button>

                            <button
                                v-if="plugin.repository"
                                @click="goToLink(plugin.repository)"
                            >
                                <img
                                    src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png"
                                    alt="git"
                                />
                                <p>仓库</p>
                            </button>

                            <button
                                v-if="plugin.author"
                                @click="goToLink(plugin.author.author_url)"
                            >
                                <img
                                    v-if="plugin.author.avatar_url"
                                    :src="plugin.author.avatar_url"
                                    class="avatar"
                                />
                                <img
                                    v-else
                                    src="https://ga.viki.moe/avatar/?d=mp"
                                    class="avatar"
                                />
                                <p v-if="plugin.author.name">
                                    {{ plugin.author.name }}
                                </p>
                                <p v-else>Unknown Author</p>
                            </button>
                            <button
                                class="brackground"
                                @click="copyToClipboard(plugin)"
                            >
                                {{
                                    plugin.copyStatus === "copied"
                                        ? "已复制"
                                        : "复制添加命令"
                                }}
                            </button>
                        </div>

                        <div class="copy-box-footer"></div>
                    </div>
                </Transition>
            </div>
        </div>
    </div>
</template>

<style>
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
    transform: translateY(8px);
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    row-gap: 8px;
    column-gap: 16px;
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
