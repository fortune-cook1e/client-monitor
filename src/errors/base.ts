import task from '../services/task'
import { ErrorCategory, LogLevel, TaskData } from '../types'

let interval: NodeJS.Timeout

const INTERVAL_TIME = 1000 * 40

class Base {
  public log: TaskData = {
    service: '',
    pagePath: '',
    category: ErrorCategory.Unknown,
    level: LogLevel.Info,
    line: 0,
    col: 0,
    message: ''
  }

  public trace(url: string, log?: TaskData) {
    const _log = log || this.log
    task.addTask(_log, url)
    task.finallyFlushTasks()

    if (interval) {
      return
    }

    interval = setInterval(() => {
      task.flushTasks()
    }, INTERVAL_TIME)
  }
}

export default Base
