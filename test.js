const Process = require('./index')

function SyncHandleSuccess(able) {
  return new Promise((resolve, reject) => {
    setTimeout(() => able ? resolve() : reject('sync error'), 500)
  })
}

const steps = new Process('test process')

steps.$on('error', (e, info) => console.log(e, info))
steps.$on('update', step => console.log('update', step))

steps.$on('defined', console.log)

steps.Add('step 0').Todo(next => {
  console.log(0)
  next()
}).Exit(async () => {
  await SyncHandleSuccess(true)
  console.log(0.5)
  steps.$emit('defined', 'user defined event')
})

steps.Add('step 1').Todo(next => {
  console.log(1)
  next()
}).Exit(async () => {
  await SyncHandleSuccess(false)
  console.log(1.5)
})

steps.Add('step 2').Todo(next => {
  console.log(2)
  next()
}).Exit(() => {
  console.log(2.5)
})

steps.Add('step 3').Todo(next => {
  console.log(3)
  next()
}).Exit(() => {
  throw 'error 3.5'
  console.log(3.5)
})

steps.Add('step 4').Todo(next => {
  throw 'error 4'
  console.log(4)
  next()
}).Exit(() => {
  console.log(4.5)
})

steps.Add('step 5').Todo(async next => {
  await SyncHandleSuccess(false)
  console.log(5)
  next()
}).Exit(() => {
  console.log(5.5)
})

steps.Add('step 6').Todo(next => {
  console.log(6)
  next()
})

steps.Add('step 7').Todo(next => {
  console.log(7)
  next()
}).Exit(() => {
  console.log(7.5)
})

steps.Add('step 8', false).Todo(next => {
  throw 'error 8'
  console.log(8)
}).Exit(() => {
  console.log(8.5)
})

steps.Add('step 9').Todo(next => {
  console.log(9)
}).Exit(() => {
  console.log(9.5)
})

steps.Run()
