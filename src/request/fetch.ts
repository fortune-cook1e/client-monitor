import Base from '../errors/base'
import { LogLevel } from '../types'
import { ErrorCategory } from '../types'
import { ErrorFields } from '../types'
import { Options } from '../types'

export function fetchInterceptor(options: Options) {
  const originFetch = window.fetch

  window.fetch = async (...args: any) => {
    const startTime = new Date().getTime()

    let url = {} as URL
    // for args[0] is Request object see: https://developer.mozilla.org/zh-CN/docs/Web/API/fetch

    if (Object.prototype.toString.call(args[0]) === '[object Request]') {
      url = new URL(args[0].url)
    } else {
      if (args[0].startsWith('http://') || args[0].startsWith('https://')) {
        url = new URL(args[0])
      } else if (args[0].startsWith('//')) {
        url = new URL(`${window.location.protocol}${args[0]}`)
      } else {
        url = new URL(window.location.href)
        url.pathname = args[0]
      }
    }

    // for tracking
    const traceId = Math.random() * 1000
    args[1].headers['trace-id'] = String(traceId)

    const response = await originFetch(args)

    try {
      // handle fetch error
      if (response && (response.status === 0 || response.status >= 400) && options?.errors?.ajax) {
        const log: ErrorFields = {
          level: LogLevel.Error,
          category: ErrorCategory.Ajax,
          errorUrl: (response && response.url) || `${url.protocol}//${url.host}${url.pathname}`,
          message: `status:${response ? response.status : 0}; statusText: ${
            response && response.statusText
          }`,
          stack: `Fetch: ${response && response.statusText}`
        }

        new Base().trace(options.url, log)
      }
    } catch (e) {
      throw new Error('Fetch Error')
    }

    return response.clone()
  }
}
