import { Options } from '../types'

import { xhrInterceptor } from './xhr'

export function traceRequest(options: Options) {
  xhrInterceptor(options)
}
