function callPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('promise error')

      reject('promise~~erro')
    }, 2000)
  })
}

callPromise()
