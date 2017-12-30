function gumbo(param) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(param.txt)
      resolve(1)
    }, param.time)
  })
}

const data = [
  { txt: 'Teil 1', time: 1000 },
  { txt: 'Teil 2', time: 2000 },
  { txt: 'Teil 3', time: 500 },
]

const arrayFunc = []

data.forEach(dat => {
  arrayFunc.push(() => {
    return gumbo(dat)
  })
})

test.skip('Test gumbo array', done => {
  const p = arrayFunc.reduce((prev, curr) => {
    return prev.then(curr)
  }, Promise.resolve(1))

  p.then(() => {
    console.log('END') // prints "RESULT is 7"
    done()
  })

  // arrayFunc
  //   .reduce((prev, curr) => {
  //     return prev.then(curr)
  //   }, Promise.resolve(1))
  //   .then(() => {
  //     console.log('END') // prints "RESULT is 7"
  //     done()
  //   })
})
