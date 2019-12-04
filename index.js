class RouteFlowEngine {
  constructor (options = {}) {
    const { config } = options
    if (config) {
      this._config = config
    }
  }

  get config () {
    return this._config
  }
}

module.exports = {
  RouteFlowEngine
}
