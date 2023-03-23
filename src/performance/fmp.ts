export interface CalScore {
  dpss: CalScore[]
  st: number
  els: ElementList
  root?: Element
}
export type ElementList = Array<{
  ele: Element
  st: number
  weight: number
}>

// element weight for calculate score
export enum ELE_WEIGHT {
  SVG = 2,
  IMG = 2,
  CANVAS = 4,
  OBJECT = 4,
  EMBED = 4,
  VIDEO = 4
}
const IGNORE_TAG_SET: string[] = ['SCRIPT', 'STYLE', 'META', 'HEAD', 'LINK']
const START_TIME: number = performance.now()

const WW: number = window.innerWidth
const WH: number = window.innerHeight
const LIMIT = 3000
const DELAY = 2000 // fmp retry interval

const TAG_ATTRIBUTE = 'fmp_c'

const getStyle = (element: Element | any, attr: any) => {
  if (window.getComputedStyle) {
    return window.getComputedStyle(element, null)[attr]
  } else {
    return element.currentStyle[attr]
  }
}

class FMP {
  public fmpTime = 0
  private callBackCount = 0
  private observer?: MutationObserver
  private statusCollector: Array<{ time: number }> = [] // nodes change time
  private flag = true
  private entries: any = {}

  constructor() {
    if (!performance || !performance.getEntries) {
      console.warn('your browser do not support performance.getEntries')
      return
    }
    this.initObserver()
  }

  private initObserver() {
    this.getFirstSnapShot()
    this.observer = new MutationObserver(() => {
      this.callBackCount++
      const time = performance.now()
      const $body: HTMLElement = document.body
      if ($body) {
        this.setTag($body, this.callBackCount)
      }
      this.statusCollector.push({
        time
      })
    })

    // observe all child nodes
    this.observer.observe(document, {
      childList: true,
      subtree: true
    })

    this.getFinalFMP()
  }

  private getFirstSnapShot() {
    const time: number = performance.now()
    const $body: HTMLElement = document.body
    if ($body) {
      this.setTag($body, this.callBackCount)
    }
    this.statusCollector.push({
      time
    })
  }

  private getFinalFMP() {
    if (!this.flag) {
      return
    }

    if (this.checkNeedCancel(START_TIME)) {
      this.observer?.disconnect()
      this.flag = false
      const res = this.getTreeScore(document.body)
      let tp: CalScore = {} as CalScore

      for (const item of res.dpss) {
        if (tp && tp.st) {
          if (tp.st < item.st) {
            tp = item
          }
        } else {
          tp = item
        }
      }

      if (!tp) {
        return false
      }
      const resultEls: ElementList = this.filterResult(tp.els)
      const fmpTiming: number = this.getFmpTime(resultEls)
      this.fmpTime = fmpTiming

      console.log({ fmpTiming })
    } else {
      setTimeout(() => {
        this.getFinalFMP()
      }, DELAY)
    }
  }

  private getFmpTime(resultEls: ElementList): number {
    let rt = 0
    for (const item of resultEls) {
      let time = 0
      if (item.weight === 1) {
        const index: number = +(item.ele.getAttribute(TAG_ATTRIBUTE) as string)
        time = this.statusCollector[index] && this.statusCollector[index].time
      } else if (item.weight === 2) {
        if (item.ele.tagName === 'IMG') {
          time = this.entries[(item.ele as HTMLImageElement).src]
        } else if (item.ele.tagName === 'SVG') {
          const index: number = +(item.ele.getAttribute(TAG_ATTRIBUTE) as string)
          time = this.statusCollector[index] && this.statusCollector[index].time
        } else {
          const match = getStyle(item.ele, 'background-image').match(/url\("(.*?)"\)/)
          let url = ''
          if (match && match[1]) {
            url = match[1]
          }
          if (!url.includes('http')) {
            url = location.protocol + match[1]
          }
          time = this.entries[url]
        }
      } else if (item.weight === 4) {
        if (item.ele.tagName === 'CANVAS') {
          const index: number = +(item.ele.getAttribute(TAG_ATTRIBUTE) as string)
          time = this.statusCollector[index] && this.statusCollector[index].time
        } else if (item.ele.tagName === 'VIDEO') {
          time = this.entries[(item.ele as HTMLVideoElement).src]
          if (!time) {
            time = this.entries[(item.ele as HTMLVideoElement).poster]
          }
        }
      }
      if (typeof time !== 'number') {
        time = 0
      }
      if (rt < time) {
        rt = time
      }
    }
    return rt
  }

  private checkNeedCancel(start: number): boolean {
    const time: number = performance.now() - start
    const lastCalTime: number =
      this.statusCollector.length > 0
        ? this.statusCollector[this.statusCollector.length - 1].time
        : 0

    return time > LIMIT || time - lastCalTime > 1000
  }

  private filterResult(els: ElementList): ElementList {
    if (els.length === 1) {
      return els
    }
    let sum = 0
    els.forEach((item: any) => {
      sum += item.st
    })
    const avg: number = sum / els.length
    return els.filter((item: any) => {
      return item.st > avg
    })
  }
  private calculateGrades(ele: Element, dpss: CalScore[]): CalScore {
    const { width, height, left, top } = ele.getBoundingClientRect()
    let isInViewPort = true
    if (WH < top || WW < left) {
      isInViewPort = false
    }
    let sdp = 0
    dpss.forEach((item: any) => {
      sdp += item.st
    })
    let weight: number = Number(ELE_WEIGHT[ele.tagName as any]) || 1
    // If there is a common element of the background image, it is calculated according to the picture
    if (
      weight === 1 &&
      getStyle(ele, 'background-image') &&
      getStyle(ele, 'background-image') !== 'initial' &&
      getStyle(ele, 'background-image') !== 'none'
    ) {
      weight = ELE_WEIGHT.IMG
    }
    // score = the area of element
    let st: number = isInViewPort ? width * height * weight : 0
    let els = [{ ele, st, weight }]
    const root = ele
    // The percentage of the current element in the viewport
    const areaPercent = this.calculateAreaParent(ele)
    // If the sum of the child's weights is greater than the parent's true weight
    if (sdp > st * areaPercent || areaPercent === 0) {
      st = sdp
      els = []
      for (const item of dpss) {
        els = els.concat(item.els)
      }
    }
    return {
      dpss,
      st,
      els,
      root
    }
  }

  private calculateAreaParent(ele: Element): number {
    const { left, right, top, bottom, width, height } = ele.getBoundingClientRect()
    const winLeft = 0
    const winTop = 0
    const winRight: number = WW
    const winBottom: number = WH
    const overlapX =
      right - left + (winRight - winLeft) - (Math.max(right, winRight) - Math.min(left, winLeft))
    const overlapY =
      bottom - top + (winBottom - winTop) - (Math.max(bottom, winBottom) - Math.min(top, winTop))

    if (overlapX <= 0 || overlapY <= 0) {
      return 0
    }
    return (overlapX * overlapY) / (width * height)
  }

  private getTreeScore(node: Element): CalScore | any {
    if (!node) {
      return {}
    }
    const dpss = []
    const children: any = node.children
    for (const child of children) {
      // Only calculate marked elements
      if (!child.getAttribute('fmp_c')) {
        continue
      }
      const s = this.getTreeScore(child)
      if (s.st) {
        dpss.push(s)
      }
    }

    return this.calculateGrades(node, dpss)
  }

  // set fmp_c custom attribute
  private setTag(target: Element, callbackCount: number): void {
    const tagName: string = target.tagName
    if (!IGNORE_TAG_SET.includes(tagName)) {
      const $children: HTMLCollection = target.children
      if ($children && !!$children.length) {
        for (let i = 0; i < $children.length; i++) {
          const $child: Element = $children[i]
          const hasSetTag = $child.getAttribute(TAG_ATTRIBUTE) !== null
          if (!hasSetTag) {
            const { left, top, width, height } = $child.getBoundingClientRect()
            if (WH < top || WW < left || width === 0 || height === 0) {
              continue
            }
            $child.setAttribute(TAG_ATTRIBUTE, `${callbackCount}`)
          }
          this.setTag($child, callbackCount)
        }
      }
    }
  }
}

export default FMP
