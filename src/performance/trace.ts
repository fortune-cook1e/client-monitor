import { Options, WebVitals } from './../types.d'
import Painting from './painting'

const DEFAULT_RECORD_TIME_OUT = 4000
class Trace {
  private perfDetail: WebVitals = {
    network: {},
    page: {}
  }

  public getPerf(options: Options) {
    this.recordPerf(options)

    if (options.spa) {
      // FixMe: hashchange not working with react-router-domV6
      window.addEventListener(
        'hashchange',
        () => {
          this.recordPerf(options)
        },
        false
      )
    }
  }

  public recordPerf(options: Options) {
    const painting = new Painting()
    painting.getPaitingTime(options)

    setTimeout(() => {
      const webVitals = this.getWebVitals(options)
      webVitals.page.fmp = painting.fmpTime
      webVitals.page.fp = painting.fpTime
      webVitals.page.fcp = painting.fcpTime

      this.perfDetail = webVitals

      // Todo: report web vitals
    }, DEFAULT_RECORD_TIME_OUT)
  }

  // PerformanceNavigationTiming: https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceNavigationTiming
  // 1.可用于确定加载或卸载文档需要多少时间

  // getEntriesByType: https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/getEntriesByType
  // 1. 返回给定类型的 PerformanceEntry 列表

  public getWebVitals(options: Options): WebVitals {
    let { timing } = window.performance as any

    if (typeof window.PerformanceNavigationTiming === 'function') {
      const nt2Timing = performance.getEntriesByType('navigation')[0]

      if (nt2Timing) {
        timing = nt2Timing
      }
    }

    let redirect = 0

    const {
      navigationStart,
      fetchStart,
      redirectEnd,
      redirectStart,
      responseStart,
      requestStart,
      connectEnd,
      connectStart,
      responseEnd,
      domInteractive,
      domContentLoadedEventEnd,
      loadEventStart,
      secureConnectionStart,
      domainLookupStart,
      domainLookupEnd
    } = timing

    if (navigationStart !== undefined) {
      redirect = fetchStart - navigationStart
    } else if (redirectEnd) {
      redirect = redirectEnd - redirectStart
    }

    const hasHttps = location.protocol === 'https'

    const webVitals: WebVitals = {
      network: {
        redirect,
        dns: domainLookupEnd - domainLookupStart,
        tcp: connectEnd - connectStart,
        ssl: hasHttps && secureConnectionStart > 0 ? connectEnd - secureConnectionStart : undefined,
        ttfb: responseStart - requestStart,
        trans: responseEnd - responseStart,
        resources: loadEventStart - domContentLoadedEventEnd,
        firstByte: responseStart - domainLookupStart
      },
      page: {
        fpt: responseEnd - responseStart,
        tti: domInteractive - domainLookupStart,
        fmp: options.fmp ? this.perfDetail.page.fmp : 0,
        domAnalysis: domInteractive - responseEnd,
        domReady: domContentLoadedEventEnd - fetchStart,
        domLoad: loadEventStart - fetchStart
      }
    }

    return webVitals
  }
}

const trace = new Trace()

export default trace
