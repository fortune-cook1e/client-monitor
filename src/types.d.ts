export interface Options {
  collector: string // domain(backend)
  spa?: boolean // single-page-app or not
}

export interface WebVitals {
  network: {
    redirect?: number // redirect time
    dns?: number // DNS parsing time
    tcp?: number // tcp connection time
    ssl?: number // ssl connection time
    ttfb?: number // time to first byte
    trans?: number // content transfer time
    resources?: number // resouce loaded time
    firstByte?: number // first byte time
  }
  page: {
    tti?: number // Time to interact
    fmp?: number // first meaningful paint time
    fpt?: number // first parint time or blank screen time
    domReady?: number // dom ready time
    domAnalysis?: number //  Interactive dom time
    domLoad?: number // page full load time
  }
}
