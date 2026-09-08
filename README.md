# 对码 DualType

Computerization 信息化社招新用的双人打字对决。一台电脑、两把键盘，谁先把屏幕上的代码敲完，谁赢。赢的人有彩带，先完成的那段程序会在旁边「跑起来」。

## 双键盘怎么分甲 / 乙

浏览器读不到「这是哪一把键盘」，所以乙的键盘要先经过 [Karabiner-Elements](https://karabiner-elements.pqrs.org/)。

**两个人可以同时打左右两侧。** 不是两个输入框抢光标：页面只监听 `keydown`，甲的 `a` 进左边，乙被改写成 `å` 的键进右边。事件是一条队列里交错到来，游戏按字符分流，所以两边进度独立。

- **甲**：Mac 内置键盘，按 `a` 就是 `a`
- **乙**：外接键盘。Karabiner **只改这一把**（Devices 里勾 Modify events），每个键叠上 Option 层，于是 `a` 变成 `å`。游戏看到 `å`，记成「乙打的 a」

内置键盘不要勾 Modify events。Karabiner 默认会把修饰键状态在「被修改的设备」之间共享；甲不进 Karabiner，Option 就不会串到甲的按键上。

退格、回车、Tab，以及 Option 会死键的 `e i n u \``，改走 Control+Option，避免触发切应用、删词等系统快捷键。

### 导入规则

1. 安装 Karabiner-Elements
2. 复制 [`public/karabiner/computerization-typeduel.json`](public/karabiner/computerization-typeduel.json) 到 `~/.config/karabiner/assets/complex_modifications/`
3. 打开 Karabiner → Complex Modifications → Add predefined rule → 启用 **Computerization 对码 · 乙键盘**
4. **Devices**：只给外接键盘勾 Modify events；内置键盘保持不勾
5. 打开游戏「接入双键盘」，两人同时打字：左栏只涨甲的字，右栏只涨乙的字

如果两把都是外接键盘，用 Karabiner EventViewer 的 Devices 页记下乙键盘的 vendor/product id，把规则里的 `device_unless: is_built_in_keyboard` 改成 `device_if` 指定那一把。

没有第二把键盘时，设置页可以切到「单键盘练习」，把全部按键算给甲或乙，方便彩排。

## 游戏机制

- 同一份代码，左右分屏，打错要退格
- 随机事件：牛来了、GC pause、npm install、镜像编译、Segmentation fault、sudo 抢权
- 先完成：彩带 + 这段代码对应的可视化（社标、霓虹灯、冒泡排序、黄金螺旋、递归树、矩阵雨、元胞、烟花、乒乓、真的牛来）

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开提示的地址（默认 `http://localhost:5173`）。招新现场用全屏。

```bash
npm run build
npm run preview
```

改完按键表后可以重新生成 Karabiner 文件：

```bash
npm run karabiner
```
