module.exports = class {
  _step = 0
  _event_hub = {}
  _step_list = []
  _is_forward = true

  get step() {
    return this._step
  }

  set step(step) {
    this._step != step && this.$emit('update', this._step = step)
  }

  constructor(name) {
    this.name = name
  }

  _EmitError(e, is_exit) {
    this.$emit('error', e, {
      name: this.name,
      step: this.step,
      step_name: this._step_list[this.step].name,
      type: is_exit ? 'exit' : 'todo'
    })
  }

  _Exit() {
    return new Promise(resolve => {
      if (!this._step_list[this.step].Exit) return resolve()

      try {
        let result = this._step_list[this.step].Exit()
        if (result instanceof Promise)
          result.then(resolve).catch(e => {
            this._EmitError(e, true)
            resolve()
          })
        else
          resolve()
      } catch(e) {
        this._EmitError(e, true)
        resolve()
      }
    })
  }

  _Next(is_forward) {
    this._is_forward = is_forward

    this._Exit().then(() => {
      let step = this.step + (is_forward ? 1 : -1)
      if (step == -1 || step == this._step_list.length) return

      this._step_list[this.step = step].Todo()
    })
  }

  Add(name, is_tolerance = true) {
    return {
      Todo: todo => {
        let step = {
          name,
          Todo: () => {
            try {
              let result = todo(is_auto => this._Next(is_auto !== true || !this._is_forward))

              if (result instanceof Promise)
                result.catch(e => {
                  this._EmitError(e)
                  is_tolerance && this._Next(this._is_forward)
                })
            } catch(e) {
              this._EmitError(e)
              is_tolerance && this._Next(this._is_forward)
            }
          }
        }

        this._step_list.push(step)

        return {
          Exit: exit => step.Exit = exit
        }
      }
    }
  }

  Run() {
    this._is_forward = true
    this._step_list[this.step = 0].Todo()
  }

  Prev() {
    this._Next(false)
  }

  Next() {
    this._Next(true)
  }

  $on(name, handle) {
    this._event_hub[name] = this._event_hub[name] || []
    this._event_hub[name].push(handle)
  }

  $emit(name, ...params) {
    this._event_hub[name]?.forEach(handle => handle(...params))
  }
}
