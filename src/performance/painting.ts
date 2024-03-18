import { Options } from '../types'

export type ScoredElement = {
  ele: Element
  score: number
  weight: number
}

export type ScoredElementList = ScoredElement[]

export interface CalculatedScore {
  dpss: CalculatedScore[]
  score: number
  eles: ScoredElementList
  root?: Element
}

export enum Score {
  Low = 1,
  Middle = 2,
  High = 4
}

// element weight for calculate score
export enum ELE_WEIGHT {
  Other = Score.Low,
  Svg = Score.Middle,
  Img = Score.Middle,
  Canvas = Score.High,
  Object = Score.High,
  Embed = Score.High,
  Video = Score.High
}

export enum ELE_TAG_NAME {
  Canvas = 'CANVAS',
  Img = 'IMG',
  Svg = 'SVG',
  Video = 'VIDEO'
}

const IGNORE_TAG_SET: string[] = ['SCRIPT', 'STYLE', 'META', 'HEAD', 'LINK']
const START_TIME: number = performance.now()

const WW: number = window.innerWidth
const WH: number = window.innerHeight
const LIMIT = 3000
const DELAY = 2000 // fmp retry interval

const FMP_ATTRIBUTE = 'fmp_c'

const getStyle = (element: Element | any, attr: any) => {
  if (window.getComputedStyle) {
    return window.getComputedStyle(element, null)[attr]
  } else {
    return element.currentStyle[attr]
  }
}

// 如何计算FMP(First Meaningful Painting)
// 1. 利用 MutationObserver 监听document对象
// 2. 给每个标签增加一个 fmp_c 属性，值对应当前 mutationObserver 回调执行的次数
// 3. 根据 dom 标签的不同（标签不同 圈中不同） 得出每个Dom结构（子dom的集合体）的得分。例如: dom下有3个标签 section/div/header 分别计算着3个标签以及子标签的得分
// 4. 然后取最高得分的dom结构体
// 5. 对dom结构体进行过滤，将低于平均分的dom过滤掉
// 6. 对得分最高过滤后的dom结构进行遍历，拿到时间最长的那一个作为 FMP时间

// 如何拿到各个资源的时间:
// 1. getEntries
//  1.1 PerformanceNavigationTiming()
//  1.2 PerformanceResourceTiming：包含各个资源加载的信息，例如 script 资源等
//  1.3 PerformancePaintTiming: 包含first-paint、first-contentful-paint 指标

// getEntries: 返回一个列表，该列表包含一些用于承载各种性能数据的对象
// getEntriesByType: 返回一个列表，该列表包含一些用于承载各种性能数据的对象，按类型过滤
class Painting {
  public fmpTime = 0
  public fcpTime = 0
  public fpTime = 0
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
  }

  public getPaitingTime(options: Options) {
    if (options.fmp) {
      this.initObserver()
    }
    this.getFPAndFCPTime()
  }

  // Get First Painting Time and First Contentful Time
  private getFPAndFCPTime(): void {
    if (typeof window.PerformancePaintTiming === 'function') {
      const paintingResults = performance.getEntriesByType('paint')
      paintingResults.forEach(p => {
        if (p.name === 'first-paint') {
          this.fpTime = p.startTime
        }
        if (p.name === 'first-contentful-paint') {
          this.fcpTime = p.startTime
        }
      })
    }
  }

  private initObserver() {
    this.getFirstSnapShot()

    // trigger callback when observed dom changes
    // it will calculate FMP every time when dom changes
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
    // when children and nested children change
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
    // flag makes sure that it will call only once
    if (!this.flag) {
      return
    }

    if (this.checkNeedCancel(START_TIME)) {
      this.observer?.disconnect()
      this.flag = false

      const treeScore = this.getTreeScore(document.body)
      let tp: CalculatedScore = {} as CalculatedScore

      if (!treeScore) return false

      // 从document下拿到得分最高的一个元素
      for (const item of treeScore.dpss) {
        if (tp && tp.score) {
          if (tp.score < item.score) {
            tp = item
          }
        } else {
          tp = item
        }
      }

      // Get all of soures load time
      performance.getEntries().forEach((item: any) => {
        if (typeof item.responseEnd !== 'undefined') {
          this.entries[item.name] = item.responseEnd
        }
      })

      if (!tp) {
        return false
      }

      const resultEls: ScoredElementList = this.filterResult(tp.eles)
      const fmpTiming: number = this.getFmpTime(resultEls)
      this.fmpTime = fmpTiming
    } else {
      setTimeout(() => {
        this.getFinalFMP()
      }, DELAY)
    }
  }

  private getFmpTime(resultEls: ScoredElementList): number {
    let rt = 0
    for (const item of resultEls) {
      let time = 0
      if (item.weight === Score.Low) {
        const index: number = +(item.ele.getAttribute(FMP_ATTRIBUTE) as string)
        time = this.statusCollector[index] && this.statusCollector[index].time
      } else if (item.weight === Score.Middle) {
        if (item.ele.tagName === ELE_TAG_NAME.Img) {
          time = this.entries[(item.ele as HTMLImageElement).src]
        } else if (item.ele.tagName === ELE_TAG_NAME.Svg) {
          const index: number = +(item.ele.getAttribute(FMP_ATTRIBUTE) as string)
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
      } else if (item.weight === Score.High) {
        if (item.ele.tagName === 'CANVAS') {
          const index: number = +(item.ele.getAttribute(FMP_ATTRIBUTE) as string)
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
    const lastCallTime: number =
      this.statusCollector.length > 0
        ? this.statusCollector[this.statusCollector.length - 1].time
        : 0

    return time > LIMIT || time - lastCallTime > 1000
  }

  // 过滤得分最大的元素
  private filterResult(els: ScoredElementList): ScoredElementList {
    if (els.length === 1) {
      return els
    }
    let sum = 0
    els.forEach((item: ScoredElement) => {
      sum += item.score
    })
    const avg: number = sum / els.length
    // Keep the elements that score above average
    return els.filter((item: ScoredElement) => {
      return item.score > avg
    })
  }

  // 1. 获取当前元素子元素的得分和:sdp
  // 2. 根据 width * height * 当前元素对应标签的权重 得到 st
  // 3. 得到当前元素在整个视口的占比:areaPercent
  // 4. 将子元素的得分 sdp 和 当前元素的得分 * 视口面积占比 进行比较
  // 5. 比较方法如下：
  //  5.1 如果sdp大，则将els填充为子元素集合
  //  5.2 否则 els 为当前元素集合
  private calculateGrades(ele: Element, dpss: CalculatedScore[]): CalculatedScore {
    const { width, height, left, top } = ele.getBoundingClientRect()
    let isInViewPort = true
    if (WH < top || WW < left) {
      isInViewPort = false
    }
    let sdp = 0

    // sum of child's weights
    dpss.forEach((item: CalculatedScore) => {
      sdp += item.score
    })

    let weight: number = Number(ELE_WEIGHT[ele.tagName as any]) || ELE_WEIGHT.Other
    // If there is a common element of the background image, it is calculated according to the picture
    if (
      weight === ELE_WEIGHT.Other &&
      getStyle(ele, 'background-image') &&
      getStyle(ele, 'background-image') !== 'initial' &&
      getStyle(ele, 'background-image') !== 'none'
    ) {
      weight = ELE_WEIGHT.Img
    }
    // score = the area of element
    let score: number = isInViewPort ? width * height * weight : 0

    let eles: ScoredElement[] = [{ ele, score, weight }]
    const root = ele
    // The percentage of the current element in the viewport
    const areaPercent = this.calculateAreaParent(ele)
    // If the sum of the child's weights is greater than the parent's true weight
    if (sdp > score * areaPercent || areaPercent === 0) {
      score = sdp
      eles = []
      for (const item of dpss) {
        eles = eles.concat(item.eles)
      }
    }
    return {
      dpss,
      score,
      eles,
      root
    }
  }

  // calculate the percentage of the current element in the viewport
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

  private getTreeScore(node: Element): CalculatedScore | null {
    if (!node) {
      return null
    }
    const dpss = []
    const children: HTMLCollection = node.children
    for (const child of children) {
      // Only calculate marked elements
      if (!child.getAttribute(FMP_ATTRIBUTE)) {
        continue
      }
      const s = this.getTreeScore(child)
      if (s && s.score) {
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
          const hasSetTag = $child.getAttribute(FMP_ATTRIBUTE) !== null
          if (!hasSetTag) {
            const { left, top, width, height } = $child.getBoundingClientRect()
            if (WH < top || WW < left || width === 0 || height === 0) {
              continue
            }
            $child.setAttribute(FMP_ATTRIBUTE, `${callbackCount}`)
          }
          this.setTag($child, callbackCount)
        }
      }
    }
  }
}

export default Painting
