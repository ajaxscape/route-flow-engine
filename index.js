
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
      // Make sure the next attribute that when executed will return the next node
      if (typeof next === 'string') {
        node.next = async () => this._flow[next]
      } else if (typeof next === 'object') {
        const { query, when } = next
        if (typeof query === 'function' && typeof when === 'object') {
          node.next = async (...args) => {
            const result = await query(...args)
            if (result === undefined) {
              throw new Error(`Expected the "next" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
            }
            if (Object.keys(when).includes(result.toString())) {
              return this._flow[when[result]]
            } else {
              throw new Error(`Expected the "next" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
            }
          }
        } else {
          throw new Error(`Expected the "next" attribute for "${id}" to contain a "query" function and a "when" object`)
        }
      }

      // Make sure the title attribute that when executed will return the next node
      if (typeof title === 'string') {
        node.title = async () => title
      } else if (typeof title === 'object') {
        const { query, when } = title
        if (typeof query === 'function' && typeof when === 'object') {
          node.title = async (...args) => {
            const result = await query(...args)
            if (result === undefined) {
              throw new Error(`Expected the "title" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
            }
            if (Object.keys(when).includes(result.toString())) {
              return when[result]
            } else {
              throw new Error(`Expected the "title" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
            }
          }
        } else {
          throw new Error(`Expected the "title" attribute for "${id}" to contain a "query" function and a "when" object`)
        }
      }
    })
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
