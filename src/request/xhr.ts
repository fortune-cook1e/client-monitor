import { CustomEventEnum, CustomizedXhr, Options, RequestConfig, XHRReadyStateEnum } from '../types'

// xhr 拦截以及Ajax错误监控整体实现:
// 1. 为了避免和其他库对 xhr 监听，所以需要自定义一个事件：xhrReadyStateChange
// 2. 利用 CustomEvent 自定义一个事件 并且监听 XHR的readystatechange 事件，并且事件中触发自定义事件
// 3. 对XHR的open以及send方法进行覆盖
//  3.1 重写 open 和 send 方法时，需要触发原XHR的open和send方法 然后在做自己的业务错误
// 4. 错误监控实现中
//  4.1 利用 window.addEventListener('xhrReadyStateChange') 监听自定义事件，通过判断 status 或其他字段来判断请求是否错误

export function xhrInterceptor(options: Options) {
  const OriginXHR = window.XMLHttpRequest
  const originXHRSend = XMLHttpRequest.prototype.send
  const originXHROpen = XMLHttpRequest.prototype.open

  if (!originXHRSend || !originXHROpen) {
    return
  }

  function addAjaxEvent(this: XMLHttpRequest, event: CustomEventEnum) {
    const ajaxEvent = new CustomEvent(event, { detail: this })
    window.dispatchEvent(ajaxEvent)
  }

  function customizedXHR() {
    const customizedXhr = new OriginXHR() as CustomizedXhr
    customizedXhr.addEventListener(
      'readystatechange',
      function () {
        addAjaxEvent.call(this, CustomEventEnum.XHRReadyStateChange)
      },
      false
    )

    customizedXhr.open = function (...args) {
      this.requestConfig = args
      return originXHROpen.apply(this, args)
    }

    customizedXhr.send = function (...args) {
      return originXHRSend.apply(this, args)
    }

    return customizedXhr
  }

  ;(window as any).XMLHttpRequest = customizedXHR

  window.addEventListener(
    CustomEventEnum.XHRReadyStateChange as any,
    (event: CustomEvent<XMLHttpRequest & { requestConfig: RequestConfig }>) => {
      console.log('xhr interceptor triggerred~')
      const xhrState = event.detail.readyState
      const config = event.detail.requestConfig

      let url = {} as URL
      if (
        (config[1] as string).startsWith('http://') ||
        (config[1] as string).startsWith('https://')
      ) {
        url = new URL(config[1] as string)
      } else if ((config[1] as string).startsWith('//')) {
        url = new URL(`${window.location.protocol}${config[1] as string}`)
      } else {
        url = new URL(window.location.href)
        url.pathname = config[1] as string
      }

      // can do sth like adding trace-id before sending
      if (xhrState === XHRReadyStateEnum.Opened) {
        const traceId = Math.random() * 1000
        event.detail.setRequestHeader('trace-id', String(traceId))
      }

      // can do sth after response like error handling
      if (xhrState === XHRReadyStateEnum.Done) {
        // do sth
      }
    }
  )
}
