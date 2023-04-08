import { ErrorCategory, LogLevel, Options } from '../types'

import Base from './base'

class ResourceError extends Base {
  public handleError(options: Options) {
    window.addEventListener(
      'error',
      event => {
        console.log('Resource Error', { event })

        if (!event) return
        const target: any = event.target
        const isElementTarget =
          target instanceof HTMLScriptElement ||
          target instanceof HTMLLinkElement ||
          target instanceof HTMLImageElement

        if (!isElementTarget) return

        console.log('Start handle Resource Error')

        this.log = {
          category: ErrorCategory.Resource,
          level: target.tagName === 'IMG' ? LogLevel.Warning : LogLevel.Error,
          errorUrl:
            (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || location.href,
          message: `load ${target.tagName} resource error`,
          stack: `load ${target.tagName} resource error`
        }

        this.trace(options.url)
      },
      true
    )
  }
}

export default new ResourceError()
