import { Options } from '../types'

import { fetchInterceptor } from './fetch'
import { xhrInterceptor } from './xhr'

export function traceRequest(options: Options) {
  xhrInterceptor(options)
  fetchInterceptor(options)
}
