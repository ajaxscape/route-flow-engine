const { RouteFlowEngine } = require('./index')

describe('RouteFlowEngine Test', () => {
  beforeEach(async () => {
    const config = this.config = { cheese: true }
    this.routeFlow = new RouteFlowEngine({ config })
  })

  it('should test that the config is returned correctly', async () => {
    const { routeFlow, config } = this
    expect(routeFlow.config).toEqual(config)
  })
})
