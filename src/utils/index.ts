import { BROWSER_LIST, OS_LIST } from '../constants'

export function getUserAgentInfo() {
  const ua = navigator.userAgent.toLowerCase()

  let device = ''
  let browser = ''
  let browserVersion = ''
  let osVersion = ''
  let os = ''

  if (ua.indexOf('iphone') >= 0) {
    device = 'iPhone'
  } else if (ua.indexOf('ipad') >= 0) {
    device = 'iPad'
  } else if (ua.indexOf('android') >= 0) {
    device = 'Android'
  } else if (ua.indexOf('windows phone') >= 0) {
    device = 'Windows Phone'
  } else if (ua.indexOf('windows') >= 0) {
    device = 'Windows PC'
  } else if (ua.indexOf('mac os') >= 0) {
    device = 'Mac'
  } else if (ua.indexOf('linux') >= 0) {
    device = 'Linux PC'
  }

  for (const item of BROWSER_LIST) {
    const match = item.version.exec(ua)
    if (match) {
      browser = item.name
      browserVersion = match[1]
      break
    }
  }

  for (const item of OS_LIST) {
    const match = item.version.exec(ua)
    if (match) {
      os = item.name
      osVersion = match[1]
      break
    }
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device
  }
}
