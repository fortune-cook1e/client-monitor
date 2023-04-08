## 如何计算 FMP(First Meaningful Painting)

1.  利用 MutationObserver 监听 document 对想
2.  给每个标签增加一个 fmp_c 属性，值对应当前 mutationObserver 回调执行的次数
3.  根据 dom 标签的不同（标签不同 圈中不同） 得出每个 Dom 结构（子 dom 的集合体）的得分。例如: dom 下有 3 个标签 section/div/header 分别计算着 3 个标签以及子标签的得分
4.  然后取最高得分的 dom 结构体
5.  对 dom 结构体进行过滤，将低于平均分的 dom 过滤掉
6.  对得分最高过滤后的 dom 结构进行遍历，拿到时间最长的那一个作为 FMP 时间

### 如何拿到各个资源的时间:

1.  getEntries

- 1.1 PerformanceNavigationTiming()
- 1.2 PerformanceResourceTiming：包含各个资源加载的信息，例如 script 资源等
- 1.3 PerformancePaintTiming: 包含 first-paint、first-contentful-paint 指标

getEntries: 返回一个列表，该列表包含一些用于承载各种性能数据的对象
getEntriesByType: 返回一个列表，该列表包含一些用于承载各种性能数据的对象，按类型过滤
