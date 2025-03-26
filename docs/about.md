<script setup>
import { VPTeamMembers, VPTeamPageSection } from 'vitepress/theme'

const authors = [
    {
        avatar: "https://proxy.viki.moe/u/92619280?v=4&proxy-host=avatars.githubusercontent.com",
        name: "三瓶可乐不过岗",
        title: "Hi 👋",
        links: [{ icon: "github", link: "https://github.com/Threkork" }],
    },
];

const contributors = [
    {
        avatar: "https://proxy.viki.moe/u/53367348?v=4&proxy-host=avatars.githubusercontent.com",
        name: "Viki",
        links: [{ icon: "github", link: "https://github.com/vikiboss" }],
    },
    {
        avatar: "https://proxy.viki.moe/u/105690584?v=4&proxy-host=avatars.githubusercontent.com",
        name: "TomZz",
        links: [{ icon: "github", link: "https://github.com/rust-kotlin" }],
    },
    {
        avatar: "https://proxy.viki.moe/u/3616727?v=4&proxy-host=avatars.githubusercontent.com",
        name: "Yuze Fu",
        links: [{ icon: "github", link: "https://github.com/xfoxfu" }],
    },
];

const thinks = [
    {
        avatar: "https://avatar.viki.moe?qq=3594168593",
        name: "溪午",
    },
    {
        avatar: "https://pic1.afdiancdn.com/user/527ee77a1ee111eeb3b65254001e7c00/avatar/0bc74d21e790d8d5c579c1e679bd8357_w256_h256_s14.jpeg?imageView2/1/w/120/h/120",
        name: "Nawyjx",
    },
    {
        avatar: "https://avatar.viki.moe?qq=1942422015",
        name: "F.L.Less",
    },
];
</script>

# 关于

## 为什么叫做 Kovi

因为机器人插件写法来源于 [KiviBot](https://b.viki.moe/) , `KiviBot` 的仓库已经不开放了，你可以看看它的作者 [Viki](https://github.com/vikiboss) 。如果你之前开发过 [KiviBot](#) 框架的插件，对于上手本框架会相对简单。

## 赞助

如果可以的话，还是进群直接V给我吧。

[爱发电](https://afdian.com/a/threkork)


<VPTeamPage>
  <VPTeamPageSection>
    <template #title>⬇️写的代码最多</template>
    <template #members>
        <VPTeamMembers size="small" :members="authors" />
    </template>
  </VPTeamPageSection>

  <VPTeamPageSection>
    <template #title>贡献者</template>
    <template #members>
        <VPTeamMembers size="small" :members="contributors" />
    </template>
  </VPTeamPageSection>

  <!-- <VPTeamPageSection>
    <template #title>赞助💕</template>
    <template #lead>还有一些匿名的小伙伴快来认领</template>
    <template #members>
        <VPTeamMembers size="small" :members="thinks" />
    </template>
  </VPTeamPageSection> -->
</VPTeamPage>