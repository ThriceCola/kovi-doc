<script setup>
import { ref, onMounted, Transition } from "vue";
import axios from "axios";

const plugins = ref([]);

//测试用
// const plugins = ref([
//     {
//         name: 'kovi-plugin-1',
//         description: 'This is a test plugin 1',
//         updated_at: '2023-01-01T00:00:00Z',
//         downloads: 100,
//         version: '1.0.0',
//         documentation: 'https://example.com/plugin1',
//         homepage: 'https://example.com/plugin1',
//         repository: 'https://github.com/example/plugin1',
//         author: 'Author 1',
//     },
//     {
//         name: 'kovi-plugin-2',
//         description: 'This is a test plugin 2',
//         updated_at: '2023-01-02T00:00:00Z',
//         downloads: 200,
//         version: '2.0.0',
//         documentation: 'https://example.com/plugin2',
//         homepage: 'https://example.com/plugin2',
//         repository: 'https://github.com/example/plugin2',
//         author: 'Author 2',
//     },
// ])

const loading = ref(true);

const fetchPluginAuthor = async (pluginName) => {
    try {
        const response = await axios.get(
            `https://crates.io/api/v1/crates/${pluginName}/owner_user`
        );

        return {
            author: response.data.users[0]?.name || "Unknown Author",
            avatar: response.data.users[0]?.avatar || null,
        };
    } catch (error) {
        console.error(`Failed to fetch author for ${pluginName}:`, error);
        return { author: "Unknown Author", avatar: null };
    }
};

const fetchPlugins = async () => {
    try {
        const response = await axios.get(
            `https://crates.io/api/v1/crates?keyword=kovi-plugin`
        );

        const pluginData = response.data.crates;

        const pluginsWithAuthors = await Promise.all(
            pluginData.map(async (plugin) => {
                const { author, avatar } = await fetchPluginAuthor(plugin.name);
                return { ...plugin, author, avatar };
            })
        );

        plugins.value = pluginsWithAuthors;
    } catch (error) {
        console.error("Failed to fetch plugins:", error);
    } finally {
        loading.value = false;
    }
};

const formatPluginName = (name) => {
    return name.replace(/^kovi-plugin-/, "");
};

const formatTextLen = (description, len) => {
    return description.length > len
        ? description.slice(0, len) + "..."
        : description;
};

const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const authorIsAuthor = (author) => {
    return author == "三瓶可乐不过岗";
};

const copyToClipboard = (text, plugin) => {
    navigator.clipboard.writeText(text).then(() => {
        plugin.copyStatus = "copied";

        if (plugin.copyTimeout) {
            clearTimeout(plugin.copyTimeout);
        }
        plugin.copyTimeout = setTimeout(() => {
            plugin.copyStatus = "default";
        }, 3000);
    });
};

const goToLink = (name) => {
    if (name) {
        const link = `https://crates.io/crates/${name}`;
        window.open(link, "_blank");
    }
};

onMounted(fetchPlugins);
</script>

<template>
    <div class="plugins-main">
        <div v-if="loading">加载中...</div>
        <div v-else class="plugin-list">
            <div
                v-for="plugin in plugins"
                :key="plugin.id"
                class="plugin-card brackground"
                @mouseover="plugin.showCopyBox = true"
                @mouseleave="plugin.showCopyBox = false"
            >
                <div @click="goToLink(plugin.name)">
                    <div class="plugin-card-box">
                        <div class="label">
                            <span
                                class="badge"
                                v-if="authorIsAuthor(plugin.author)"
                                >官方插件</span
                            >
                            <span class="version">{{
                                plugin.max_stable_version
                            }}</span>
                        </div>
                        <div class="plugin-header">
                            <div class="plugins-h2">
                                {{ formatPluginName(plugin.name) }}
                            </div>
                        </div>
                        <p class="description">
                            {{ formatTextLen(plugin.description, 50) }}
                        </p>
                    </div>
                    <div class="card-footer">
                        <p class="last-updated">
                            {{ formatDate(plugin.updated_at) }}
                        </p>
                        <div style="display: flex; align-items: center">
                            <img
                                v-if="plugin.avatar"
                                :src="plugin.avatar"
                                class="avatar"
                            />
                            <img
                                v-else
                                src="https://ga.viki.moe/avatar/?d=mp"
                                class="avatar"
                            />
                            <p class="author" v-if="plugin.author">
                                {{ plugin.author }}
                            </p>
                            <p class="author" v-else>Unknown Author</p>
                        </div>
                    </div>
                </div>
                <Transition name="copy-box">
                    <div v-show="plugin.showCopyBox" class="copy-box">
                        <p>
                            cargo kovi add {{ formatPluginName(plugin.name) }}
                        </p>
                        <button
                            class="brackground"
                            @click="
                                copyToClipboard(
                                    `cargo kovi add ${formatPluginName(
                                        plugin.name
                                    )}`,
                                    plugin
                                )
                            "
                        >
                            {{
                                plugin.copyStatus === "copied"
                                    ? "已复制"
                                    : "复制"
                            }}
                        </button>
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
    row-gap: 16px;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    max-width: 180px;
}

.label {
    position: absolute;
    right: 0%;
    /* 必须横向布局 */
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    text-align: center;
    font-size: 14px;
    margin-right: 15px;
    color: var(--vp-c-text-1);
}

.badge {
    display: flex;
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

.version {
    display: flex;
    align-items: center;
    background-color: #eff0f3;
    border-radius: 4px;
    padding: 2px 8px;
    max-height: 26px;
}

:root.dark .version {
    background-color: #272a2f;
    color: var(--vp-code-color);
}

.version {
    display: flex;
    align-items: center;
    background-color: #eff0f3;
    border-radius: 4px;
    padding: 2px 8px;
    max-height: 26px;
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
}

:root.dark .version {
    background-color: #313131;
}

.version {
    display: flex;
    align-items: center;
    background-color: #eff0f3;
    border-radius: 4px;
    padding: 2px 8px;
    max-height: 26px;
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
    bottom: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.473);
    backdrop-filter: blur(6px);
    color: var(--vp-c-text-1);

    padding: 5px 16px 5px 16px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

:root.dark .copy-box {
    background-color: rgba(27, 27, 31, 0.473);
    backdrop-filter: blur(6px);
    color: #ffffff;
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
