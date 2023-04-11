import { ErrorCategory, LogLevel, Options } from '../types'

import Base from './base'

class FrameError extends Base {
  public handleError(options: Options, error: Error) {
    this.log = {
      category: ErrorCategory.Js,
      level: LogLevel.Error,
      errorUrl: error.name || location.href,
      message: error.message,
      stack: error.stack
    }

    this.trace(options.url)
  }
}

export default new FrameError()
