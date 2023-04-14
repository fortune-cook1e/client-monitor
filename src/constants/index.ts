export const BROWSER_LIST = [
  {
    key: 'Edge',
    name: 'Edge',
    version: /edge\/([\d]+)/
  },
  {
    key: 'Chrome',
    name: 'Chrome',
    version: /chrome\/([\d]+)/
  },
  {
    key: 'Firefox',
    name: 'Firefox',
    version: /firefox\/([\d]+)/
  },
  {
    key: 'Safari',
    name: 'Safari',
    version: /version\/([\d]+)/
  },
  {
    key: 'IE',
    name: 'IE',
    version: /msie ([\d]+)/
  },
  {
    key: 'IE',
    name: 'IE',
    version: /rv:([\d]+)/
  }
]

export const OS_LIST = [
  {
    key: 'Windows',
    name: 'Windows',
    version: /windows nt ([\d.]+)/
  },
  {
    key: 'Mac OS X',
    name: 'macOS',
    version: /os x ([\d_.]+)/
  },
  {
    key: 'iOS',
    name: 'iOS',
    version: /os ([\d_.]+) like mac os/
  },
  {
    key: 'Android',
    name: 'Android',
    version: /android ([\d.]+)/
  },
  {
    key: 'Linux',
    name: 'Linux',
    version: /linux/
  }
]
