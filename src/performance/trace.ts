import { Options, WebVitals } from './../types.d'
class Trace {
  private perfDetail: WebVitals = {
    network: {},
    page: {}
  }

  public getPerf(options: Options) {
    this.recordPerf(options)
    // Todo: monitor SPA hash change
  }

  public recordPerf(options: Options) {
    setTimeout(() => {
      this.getPerfTiming()
    }, 1)
  }

  public getPerfTiming(): WebVitals {
    let { timing } = window.performance as any

    // Todo: figure out differences between performance and PerformanceNavigationTiming
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
        fmp: 0,
        domAnalysis: domInteractive - responseEnd,
        domReady: domContentLoadedEventEnd - fetchStart,
        domLoad: loadEventStart - fetchStart
      }
    }

    this.perfDetail = webVitals

    console.log({ webVitals })

    return webVitals
  }
}

const trace = new Trace()

export default trace
