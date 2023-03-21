export interface Options {
  collector: string // domain(backend)
  spa?: boolean // single-page-app or not
}

export interface WebVitals {
  redirect?: number
  dns?: number // DNS query time
  ttfb?: number // time to first byte
  tcp?: number // tcp connection time
  trans?: number // content transfer time
  domAnalysis?: number // Dom parsing time
  fpt?: number // first parint time or blank screen time
  domReady?: number // dom ready time
  loadPage?: number // page full load time
  res?: number // Synchronous load resources in the page
  ssl?: number // Only valid for https
  ttl?: number // Time to interact
  firstPack?: number // first pack time
  fmp?: number
}
