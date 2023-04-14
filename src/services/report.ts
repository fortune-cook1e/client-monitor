import { Options, ReportType, XHRReadyStateEnum } from '../types'

class Report {
  private type: ReportType
  private url: string

  constructor(type: ReportType, options: Options) {
    this.type = type
    this.url = options.url
  }

  // xhr 特点：https://zh.javascript.info/xmlhttprequest
  // 1. 可以兼容旧浏览器
  // 2. 跟踪上传进度
  // 3. 2种执行模式：同步和异步
  public sendByXHR(data: any) {
    if (!this.url) {
      return
    }
    const xhr = new XMLHttpRequest()
    // asynchronously upload data
    xhr.open('post', this.url, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XHRReadyStateEnum.Done && xhr.status === 200) {
        console.log('Report Successfully')
      }
    }

    const sendData = {
      ...data,
      type: this.type
    }
    xhr.send(JSON.stringify(sendData))
  }

  public sendByBeacon(data: any) {
    if (!this.url) return

    if (typeof navigator.sendBeacon === 'function') {
      // Todo: figure out why sendBeacon send no data to server
      const blob = new Blob(
        [
          JSON.stringify({
            ...data,
            sendByBeacon: 1
          })
        ],
        { type: 'application/json; charset=UTF-8' }
      )
      navigator.sendBeacon(this.url, blob)
      return
    }
  }
}

export default Report
