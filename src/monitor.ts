import { Options } from './types'

const DEFAULT_OPTIONS: Options = {
  collector: location.host
}

const { onload, addEventListener } = window

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
    this.performance(config)
  }

  performance(config?: Partial<Options>) {
    if (document.readyState === 'complete') {
      // Todo: do same thing as load
      console.log('complete')
    } else {
      addEventListener(
        'load',
        () => {
          // do sth
          console.log('load..')
        },
        false
      )
    }
  }
}
