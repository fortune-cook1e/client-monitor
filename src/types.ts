export interface ErrorsOption {
  js?: boolean
  ajax?: boolean
  resource?: boolean
  promise?: boolean
}

export interface ReportOptions {
  performance?: boolean
  error?: ErrorsOption
}

export interface Options {
  url: string // domain(backend)
  spa?: boolean // single-page-app or not
  fmp?: boolean // enable fmp calculation
  errors?: ErrorsOption
  report?: ReportOptions
  handleError?: boolean
}

export interface WebVitals {
  redirect?: number // redirect time
  dns?: number // DNS parsing time
  tcp?: number // tcp connection time
  ssl?: number // ssl connection time
  ttfb?: number // time to first byte
  trans?: number // content transfer time
  resources?: number // resouce loaded time
  firstByte?: number // first byte time
  tti?: number // Time to interact
  fmp?: number // first meaningful paint time
  fcp?: number // first contentful time
  fp?: number // first painting time
  fpt?: number // first parint time or blank screen time
  domReady?: number // dom ready time
  domAnalysis?: number //  Interactive dom time
  domLoad?: number // page full load time
}

export enum ReportType {
  Performance = 1,
  Error = 2,
  Errors = 3
}

export enum XHRReadyStateEnum {
  Unsent = 0,
  Opened = 1, // open has been called
  Received = 2, // send has benn called
  Loading = 3,
  Done = 4
}

export enum LogLevel {
  Info = 'info',
  Warning = 'warning',
  Error = 'error'
}

export enum ErrorCategory {
  Unknown = 0,
  Ajax = 1,
  Js = 2,
  Resource = 3,
  Promise = 4
}

export enum CustomEventEnum {
  XHRReadyStateChange = 'xhrReadyStateChange'
}

export interface ErrorFields {
  level: LogLevel
  message: any
  category: ErrorCategory
  errorUrl?: string
  line?: number
  col?: number
  stack?: string
  firstReportedError?: boolean
}

export interface ReportFields {
  pagePath?: string
  service?: string
}

export type TaskData = ErrorFields & ReportFields

export type RequestConfig = [
  method: string,
  url: string | URL,
  async: boolean,
  username?: string | null | undefined,
  password?: string | null | undefined
]

export interface CustomizedXhr extends Omit<XMLHttpRequest, 'open'> {
  requestConfig?: RequestConfig
  open(
    method: string,
    url: string | URL,
    async: boolean,
    username?: string | null,
    password?: string | null
  ): void
}
