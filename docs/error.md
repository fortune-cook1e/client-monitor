## 异常指标

可以捕捉到 4 种错误：

1. window.addeventlistener ('error ', callback, true) 捕捉资源加载错误。
2. window.onerror 抓取 JS 执行错误。
3. window.addEventListener ('unhandledrejection', callback) 用来捕捉 Promise 错误。
4. Ajax 错误由 addEventListener ('error'，callback);addEventListener ('abort'，callback);addEventListener ('timeout'，callback); 在 send callback 中捕获。
