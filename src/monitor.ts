import { JSError, PromiseError, ResourceError } from './errors/index'
import trace from './performance/trace'
import { ErrorsOption, Options, ReportOptions } from './types'

const DEFAULT_ERROR_OPTIONS: ErrorsOption = {
  js: true,
  ajax: false,
  resource: true,
  promise: true
}

const DEFAULT_REPORT_OPTIONS: ReportOptions = {
  performance: false,
  error: {
    js: true,
    ajax: true,
    resource: true
  }
}

const DEFAULT_OPTIONS: Required<Options> = {
  url: location.host,
  spa: false,
  fmp: false,
  errors: DEFAULT_ERROR_OPTIONS,
  report: DEFAULT_REPORT_OPTIONS
}

export class Monitor {
  options: Options
  constructor(options: Partial<Options>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      errors: {
        ...DEFAULT_OPTIONS.errors,
        ...options?.errors
      },
      report: {
        ...DEFAULT_OPTIONS.report,
        ...options?.report
      }
    }
  }

  register(config?: Partial<Options>) {
    this.options = {
      ...this.options,
      ...config
    }
    this.performance()
    this.catchErrors(this.options)
  }

  performance() {
    if (document.readyState === 'complete') {
      trace.getPerf(this.options)
    } else {
      window.addEventListener(
        'load',
        () => {
          trace.getPerf(this.options)
        },
        false
      )
    }
  }

  catchErrors(options: Options) {
    const { errors = DEFAULT_ERROR_OPTIONS } = options
    const { js = true, ajax = false, resource = true, promise = true } = errors
    js && JSError.handleError(options)
    resource && ResourceError.handleError(options)
    promise && PromiseError.handleError(options)
  }
}
