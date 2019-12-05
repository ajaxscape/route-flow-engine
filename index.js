
const merge = require('deepmerge')

class RouteFlowEngine {
  constructor (options = {}) {
    const { config, createRoute, resolveQuery } = options

    if (typeof config === 'object') {
      this._config = merge({}, config)
    } else {
      throw new Error('config object required')
    }

    if (typeof createRoute === 'function') {
      this._createRoute = createRoute
    } else {
      throw new Error('createRoute function required')
    }

    if (typeof resolveQuery === 'function') {
      this._resolveQuery = resolveQuery
    } else {
      throw new Error('resolveQuery function required')
    }

    this._parseFlow(config, resolveQuery)
  }

  _parseFlow (config) {
    this._flow = merge({}, config)
    Promise.all(Object.entries(this._flow)
      .map(async ([id, node]) => {
        const { next, title } = node
        node.id = id
        const route = await this._createRoute(node)
        node.next = this.resolveAttribute(route, id, 'next', next, (val) => this._flow[val])
        node.title = this.resolveAttribute(route, id, 'title', title)
        return route
      })
    )
  }

  resolveAttribute (route, id, attr, val, fn = (val) => val) {
    if (typeof val === 'string') {
      return async () => {
        return fn(val)
      }
    } else if (typeof val === 'object') {
      const { query, when } = val
      if (typeof query === 'string' && typeof when === 'object') {
        return async (...args) => {
          const result = await this._resolveQuery(route, query, ...args)
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
