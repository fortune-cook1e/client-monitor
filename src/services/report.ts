import { Options, ReportType } from '../types'

class Report {
  private type: ReportType
  private url: string

  constructor(options: Options, type: ReportType) {
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
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log('Report Successfully')
      }
    }

    const sendData = {
      ...data,
      type: this.type
    }
    xhr.send(JSON.stringify(sendData))
  }
}

export default Report
