const errorScriptUrl = 'https://unpkg.com/vue@3.2.47/dist/vue.glo2321bal.js'

const imgErrorUrl = 'https://plus.unsplash.com/premium_photo-1673002094146-f14d57d563b9321321'

const addScript = () => {
  const scriptEle = document.createElement('script')
  scriptEle.src = errorScriptUrl
  document.getElementsByTagName('body')[0].appendChild(scriptEle)
}

const addImg = () => {
  const imgEle = document.createElement('img')
  imgEle.src = imgErrorUrl
  document.getElementsByTagName('body')[0].appendChild(imgEle)
}

setTimeout(() => {
  addScript()
  addImg()
}, 2000)
