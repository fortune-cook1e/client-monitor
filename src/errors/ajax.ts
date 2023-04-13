import {
  CustomEventEnum,
  ErrorCategory,
  LogLevel,
  Options,
  RequestConfig,
  XHRReadyStateEnum
} from '../types'

import Base from './base'

class AjaxError extends Base {
  public handleError(options: Options) {
    if (!window.XMLHttpRequest) return

    window.addEventListener(
      CustomEventEnum.XHRReadyStateChange as any,
      (event: CustomEvent<XMLHttpRequest & { requestConfig: RequestConfig }>) => {
        const detail = event.detail
        if (detail.readyState !== XHRReadyStateEnum.Done) {
          return
        }

        if (detail.status !== 0 && detail.status < 400) {
          return
        }

        this.log = {
          category: ErrorCategory.Ajax,
          level: LogLevel.Error,
          errorUrl: detail.requestConfig[1] as string,
          message: `status: ${detail.status}; statusText:${detail.statusText}`,
          stack: detail.responseText
        }
        this.trace(options.url)
      }
    )
  }
}

export default new AjaxError()
