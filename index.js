export default class {
  _step = 0
  step_list = []
  event_hub = {}

  get step() {
    return this._step
  }

  set step(value) {
    this._step != value && this.$emit('update', value)
    this._step = value
  }

  constructor(name) {
    this.name = name
  }

  Reject(e, reject) {
    this.$emit('error', e, this.step, this.step_list[this.step].name, this.name)
    this.step_list[this.step].is_tolerance && reject()
  }

  Catch(todo, reject) {
    try {
      todo()
    } catch(e) {
      this.Reject(e, reject)
    }
  }

  Next() {
    if (this.step == this.step_list.length - 1) return
    this.Catch(() => {
      this.step_list[this.step].Exit?.()
      this.step_list[++this.step].Todo()
    }, () => {
      this.Next()
    })
  }

  Prev() {
    if (!this.step) return
    this.Catch(() => {
      this.step_list[this.step].Exit?.()
      this.step_list[--this.step].Todo(true)
    }, () => {
      this.Prev()
    })
  }

  Add(name, is_tolerance = true) {
    return {
      Todo: next => {
        let index = this.step_list.length

        let step = {
          name,
          is_tolerance,
          Todo: is_prev => {
            let result = next(is_auto => {
              if (index != this.step) return
              is_auto === true && is_prev ? this.Prev() : this.Next()
            })

            if (result instanceof Promise)
              result.catch(e => this.Reject(e, () => is_prev ? this.Prev() : this.Next()))
          }
        }

        this.step_list.push(step)

        return {
          Exit: exit => step.Exit = exit
        }
      }
    }
  }

  Run() {
    this.Catch(this.step_list[this.step = 0].Todo, () => this.Next())
  }

  $on(name, todo) {
    this.event_hub[name] = this.event_hub[name] || []
    this.event_hub[name].push(todo)
  }

  $emit(name, ...params) {
    this.event_hub[name]?.forEach(todo => todo(...params))
  }
}
