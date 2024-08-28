<script setup>
import { ref, onMounted, Transition } from 'vue';
import axios from 'axios';

const plugins = ref([]);
const loading = ref(true);

const fetchPluginAuthor = async (pluginName) => {
    try {
        const response = await axios.get(
            `https://crates.io/api/v1/crates/${pluginName}/owner_user`
        );

        return {
            author: response.data.users[0]?.name || 'Unknown Author',
            avatar: response.data.users[0]?.avatar || null,
        };
    } catch (error) {
        console.error(`Failed to fetch author for ${pluginName}:`, error);
        return { author: 'Unknown Author', avatar: null };
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
        console.error('Failed to fetch plugins:', error);
    } finally {
        loading.value = false;
    }
};

const formatPluginName = (name) => {
    return name.replace(/^kovi-plugin-/, '');
};

const formatPluginDescription = (description) => {
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const authorIsAuthor = (author) => {
    return author == '三瓶可乐不过岗';
};

const copyToClipboard = (text, plugin) => {
    navigator.clipboard.writeText(text).then(() => {
        plugin.copyStatus = 'copied';

        if (plugin.copyTimeout) {
            clearTimeout(plugin.copyTimeout);
        }
        plugin.copyTimeout = setTimeout(() => {
            plugin.copyStatus = 'default';
        }, 3000);
    });
};

const goToLink = (name) => {
    if (name) {
        const link = `https://crates.io/crates/${name}`
        window.open(link, '_blank');
    }
}

onMounted(fetchPlugins);
</script>

<template>
    <div class="plugins-main">
        <div v-if="loading">加载中...</div>
        <div v-else class="plugin-list">
            <div v-for="plugin in plugins" :key="plugin.id" class="plugin-card" @mouseover="plugin.showCopyBox = true"
                @mouseleave="plugin.showCopyBox = false" @click="goToLink(plugin.name)">
                <div class="plugin-card-box">
                    <div class="plugin-header">
                        <div class="plugins-h2">{{ formatPluginName(plugin.name) }}</div>
                        <div>
                            <span class="badge" v-if="authorIsAuthor(plugin.author)">官方插件</span>
                            <span class="version">{{ plugin.max_stable_version }}</span>
                        </div>
                    </div>
                    <p class="description">{{ formatPluginDescription(plugin.description) }}</p>
                    <div class="card-footer">
                        <p class="last-updated">{{ formatDate(plugin.updated_at) }}</p>
                        <div style="display: flex; align-items: center;">
                            <img v-if="plugin.avatar" :src="plugin.avatar" class="avatar" />
                            <img v-else src="https://ga.viki.moe/avatar/?d=mp" class="avatar" />
                            <p class="author" v-if="plugin.author">{{ plugin.author }}</p>
                            <p class="author" v-else>Unknown Author</p>
                        </div>
                    </div>
                </div>

                <Transition name="copy-box">
                    <div v-show="plugin.showCopyBox" class="copy-box">
                        <p>cargo kovi add {{ formatPluginName(plugin.name) }}</p>
                        <button @click="copyToClipboard(`cargo kovi add ${formatPluginName(plugin.name)}`, plugin)">
                            {{ plugin.copyStatus === 'copied' ? '已复制' : '复制' }}
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
    font-size: 25px;
    color: #232323;
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
    row-gap: 16px
}

.plugin-card {
    position: relative;
    background-color: #fff;
    border-radius: 12px;
    padding: 16px;
    box-sizing: border-box;
    border: 1px solid var(--vp-c-divider);
    transition: all 0.3s;
}

.plugin-card:hover {
    border: 1px solid var(--vp-c-brand-1);
}

.plugin-card p {
    margin: 0;
    font-weight: 500;
    font-size: 16px;

}

.plugin-card-box {
    min-width: 280px;
    height: 150px;
    top: 10px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.plugin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.plugin-header h2 {
    margin-bottom: 10px;
    font-size: 22px;
}

.badge {
    background-color: #97e9b4;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 14px;
    margin-right: 4px;
}

.version {
    background-color: #ffb656;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 14px;
}

.description {
    min-height: 50px;
    margin: 0;
    color: #515151;
}

.card-footer {
    color: #c5c5c5;
    position: absolute;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    bottom: 0;
    width: 100%;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 8px;
}

.author {
    color: #999;
}

.last-updated {
    color: #999;
}

.copy-box {
    position: absolute;
    bottom: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.473);
    backdrop-filter: blur(6px);
    color: #000000;

    padding: 5px 16px 5px 16px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}


.copy-box p {
    margin: 0;
    font-weight: 500;
    font-size: 16px;
    color: #515151;
}

.copy-box button {
    background-color: #ffffff;
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
    background-color: #fff;
    transition: all 0.3s;
}
</style>
