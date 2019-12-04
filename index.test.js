const { RouteFlowEngine } = require('./index')
const merge = require('deepmerge')

const config = {
  home: {
    path: '/',
    next: 'first-page'
  },

  'first-page': {
    path: 'first-page',
    title: 'The first page',
    next: {
      query: function (choice) { return choice },
      when: {
        false: 'second-page',
        true: 'third-page'
      }
    }
  },

  'second-page': {
    path: 'second-page',
    title: {
      query: function (choice) { return choice },
      when: {
        false: 'The second page',
        true: 'The alternative second page'
      }
    },
    next: 'third-page'
  },

  'third-page': {
    path: 'third-page',
    title: 'The third page',
    next: 'first-page'
  }
}

describe('RouteFlowEngine Test', () => {
  beforeEach(async () => {
    this.config = merge({}, config)
    this.routeFlow = new RouteFlowEngine({ config: this.config })
  })

  it('config should be intact', async () => {
    const { config } = this.routeFlow
    expect(config).toEqual(this.config)
  })

  it('home should flow to first page', async () => {
    const { flow } = this.routeFlow
    const node = flow.home
    expect(node.title).toEqual(undefined)
    expect(await node.next()).toEqual(flow['first-page'])
  })

  it('first page should flow to second page', async () => {
    const { flow } = this.routeFlow
    const node = flow['first-page']
    expect(await node.title()).toEqual('The first page')
    expect(await node.next(false)).toEqual(flow['second-page'])
  })

  it('first page should flow to third page', async () => {
    const { flow } = this.routeFlow
    const node = flow['first-page']
    expect(await node.next(true)).toEqual(flow['third-page'])
  })

  it('second page should flow to third page', async () => {
    const { flow } = this.routeFlow
    const node = flow['second-page']
    expect(await node.title(false)).toEqual('The second page')
    expect(await node.next()).toEqual(flow['third-page'])
  })

  it('second page should have alternative title', async () => {
    const { flow } = this.routeFlow
    const node = flow['second-page']
    expect(await node.title(true)).toEqual('The alternative second page')
  })

  it('third page should flow to first page', async () => {
    const { flow } = this.routeFlow
    const node = flow['third-page']
    expect(await node.title()).toEqual('The third page')
    expect(await node.next()).toEqual(flow['first-page'])
  })
})
