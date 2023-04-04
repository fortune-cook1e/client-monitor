export interface Options {
  url: string // domain(backend)
  spa?: boolean // single-page-app or not
  fmp?: boolean // enable fmp calculation
  errors?: {
    js?: boolean
    ajax?: boolean
  }
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

export enum XHRState {
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
  Resource = 3
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
  pagePath: string
  service?: string
}

export type TaskData = ErrorFields & ReportFields
