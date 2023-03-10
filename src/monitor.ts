import { Options } from './types'

const DEFAULT_OPTIONS: Options = {
  collector: location.host
}

class Monitor {
  options: Options
  constructor(options: Partial<Options>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    }
  }
}

export default Monitor
