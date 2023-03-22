import trace from './performance/trace'
import { Options } from './types'

const DEFAULT_OPTIONS: Options = {
  collector: location.host
}

export class Monitor {
  options: Options
  constructor(options: Partial<Options>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    }
  }

  // register config
  register(config?: Partial<Options>) {
    this.options = {
      ...this.options,
      ...config
    }
    this.performance()
  }

  performance() {
    if (document.readyState === 'complete') {
      // Todo: do same thing as load
      console.log('complete')
    } else {
      window.addEventListener(
        'load',
        () => {
          // do sth
          trace.getPerf(this.options)
        },
        false
      )
    }
  }
}
