
const merge = require('deepmerge')

class RouteFlowEngine {
  constructor (options = {}) {
    const { config } = options

    if (config) {
      this._config = merge({}, config)
    }

    this._parseFlow(config)
  }

  _parseFlow (config) {
    this._flow = merge({}, config)
    Object.entries(this._flow).forEach(([id, node]) => {
      const { next, title } = node
      node.next = this.resolveAttribute(id, 'next', next, (val) => this._flow[val])
      node.title = this.resolveAttribute(id, 'title', title)
    })
  }

  resolveAttribute (id, attr, val, fn = (val) => val) {
    if (typeof val === 'string') {
      return async () => {
        return fn(val)
      }
    } else if (typeof val === 'object') {
      const { query, when } = val
      if (typeof query === 'function' && typeof when === 'object') {
        return async (...args) => {
          const result = await query(...args)
          if (result === undefined) {
            throw new Error(`Expected the "${attr}" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
          }
          if (Object.keys(when).includes(result.toString())) {
            return fn(when[result])
          } else {
            throw new Error(`Expected the "${attr}" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
          }
        }
      } else {
        throw new Error(`Expected the "${attr}" attribute for "${id}" to contain a "query" function and a "when" object`)
      }
    }
  }

  get config () {
    return this._config
  }

  get flow () {
    return this._flow
  }
}

module.exports = {
  RouteFlowEngine
}
