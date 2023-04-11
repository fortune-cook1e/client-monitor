import { ErrorCategory, LogLevel, Options } from '../types'

import Base from './base'

class PromiseError extends Base {
  public handleError(options: Options) {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      console.log('trigger unhandledrejection', { event })
      let url = ''
      if (!event || !event.reason) return

      if (event?.reason?.config?.url) {
        url = event.reason.config.url
      }

      this.log = {
        category: ErrorCategory.Promise,
        level: LogLevel.Error,
        errorUrl: url || location.href,
        message: typeof event.reason === 'string' ? event.reason : event.reason.message,
        stack: typeof event.reason === 'string' ? event.reason : event.reason.stack
      }
      this.trace(options.url)
    })
  }
}

export default new PromiseError()
