import { Options, ReportType, XHRState } from '../types'

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
      if (xhr.readyState === XHRState.Done && xhr.status === 200) {
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
      // post method
      // FixMe: why sendBeacon doesn't send data
      navigator.sendBeacon(this.url, data)
      return
    }

    this.sendByXHR(data)
  }
}

export default Report
