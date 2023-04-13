import { ErrorCategory, LogLevel, Options } from '../types'

import Base from './base'

class JSError extends Base {
  public handleError(options: Options) {
    window.onerror = (
      event: Event | string,
      source?: string,
      line?: number,
      col?: number,
      error?: Error
    ) => {
      this.log = {
        category: ErrorCategory.Js,
        level: LogLevel.Error,
        line,
        col,
        errorUrl: source,
        message: event,
        pagePath: location.pathname,
        stack: error ? error.stack : ''
      }
      this.trace(options.url)
    }
  }
}

export default new JSError()
