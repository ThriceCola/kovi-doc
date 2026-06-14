# Event 导航

当然了，每个服务端和驱动器提供的事件是不一样的。

可以通过下面卡片去查看你喜欢的 Event 列表。

----

<div class="box">
  <a href="/api/onebot_event">
    <p>OneBot</p>
  </a>
  <a href="/api/milky_event">
    <p>Milky</p>
  </a>
</div>

<style>
.box {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 32px;
    justify-content: center;
}

.box a {
    position: relative;
    border-radius: 12px;
    box-sizing: border-box;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    height: 100px;
    width: 200px;
    transition: all 0.3s;
    word-break: break-all;
    text-decoration: none;

    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.box a:hover {
    border: 1px solid var(--vp-c-brand-1);
    background-color: var(--vp-c-bg-mute);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transform: translateY(-1px);
}

.box a p {
    margin: 0;
    font-weight: 700;
    font-size: 22px;
    color: var(--vp-c-text-1);
    text-align: center;
}

.box a::after {
    content: "➞";
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-size: 30px;
    color: var(--vp-c-text-3);
    opacity: 0;
    transition: all 0.3s;
}

.box a:hover::after {
    opacity: 0.6;
}
</style>
