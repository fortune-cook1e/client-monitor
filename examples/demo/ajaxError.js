const instance = axios.create({
  baseURL: 'http://localhost:3000/api'
})

instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const { data, status } = response
    if (!data.code !== 2 || status !== 200) {
      return Promise.reject(data?.msg || '服务器异常')
    }
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  }
)

const asyncGetData = () => {
  instance.get('http://localhost:3000/api/gagaga').then(res => {
    console.log({ res })
  })
}

setTimeout(() => {
  asyncGetData()
}, 2000)
