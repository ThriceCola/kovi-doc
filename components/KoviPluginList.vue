<script setup>
import { ref, onMounted } from 'vue';
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

onMounted(fetchPlugins);
</script>

<template>
    <div class="plugins-main">
        <div v-if="loading">加载中...</div>
        <div v-else class="plugin-list">
            <div v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
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
                            <img v-else src="https://ga.viki.moe/avatar/85b811971305432e0c5c7e858b214ead?d=mp"
                                class="avatar" />
                            <p class="author" v-if="plugin.author">{{ plugin.author }}</p>
                            <p class="author" v-else>Unknown Author</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style>
.plugins-h2 {
    font-weight: 700;
    font-size: 25px;
    color: #232323;
}

.plugins-main {
    display: flex;
    flex-direction: column;
    /* 将容器的主轴方向设置为垂直方向 */
    justify-content: center;
    /* 水平方向居中 */
    align-items: center;
    /* 垂直方向居中 */
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
    background-color: #fefefe;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 16px;

    box-sizing: border-box;
}

.plugin-card-box {
    min-width: 280px;
    height: 150px;
    top: 10px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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

.plugin-card p {
    margin: 8px 0;
    font-size: 15px;
}

.description {
    font-size: 14px;
    min-height: 50px;
}

.card-footer {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
</style>
