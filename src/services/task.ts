import { ReportType, TaskData } from '../types'

import Report from './report'

class TaskQueue {
  private queues: TaskData[] = []
  private url = ''

  public addTask(task: TaskData, url: string) {
    this.queues.push(task)
    this.url = url
  }

  public flushTasks() {
    if (!this.queues.length) return

    new Report(ReportType.Errors, { url: this.url }).sendByXHR({
      type: ReportType.Errors,
      errors: this.queues
    })
    this.queues = []
  }

  public finallyFlushTasks() {
    window.addEventListener('visibilitychange', event => {
      if (document.visibilityState === 'hidden') {
        if (!this.queues.length) return

        new Report(ReportType.Errors, { url: this.url }).sendByBeacon({
          type: ReportType.Errors,
          errors: this.queues
        })
      }
    })
  }
}

export default new TaskQueue()
