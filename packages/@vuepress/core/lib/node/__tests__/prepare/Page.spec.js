const Page = require('../../Page')
const App = require('../../App')

const {
  getMarkdown,
  getDocument,
  readFile
} = require('./util')

let app
let computed

beforeAll(async () => {
  app = new App()
  await app.process()
  computed = new app.ClientComputedMixinConstructor()
})

async function setupPage (options, processOption = {}) {
  const page = new Page(options, app)
  await page.process({ computed, ...processOption })
  return page
}

test('pure route', async () => {
  const page = await setupPage({ path: '/' })

  expect(page.path).toBe('/')
  expect(page.regularPath).toBe('/')
  expect(page.frontmatter).toEqual({})
})

test('pure route - encodeURI', async () => {
  const path = '/尤/'
  const page = await setupPage({ path })

  expect(page.path).toBe(encodeURI(path))
  expect(page.regularPath).toBe(encodeURI(path))
  expect(page.frontmatter).toEqual({})
})

test('pure route - custom frontmatter', async () => {
  const frontmatter = { title: 'alpha' }
  const page = await setupPage({
    path: '/',
    frontmatter
  })

  expect(page.frontmatter.title).toBe(frontmatter.title)
})

test('pure route - enhancers', async () => {
  const frontmatter = { title: 'alpha' }
  const enhancers = [
    {
      name: 'plugin-a',
      value: page => {
        page.frontmatter.title = 'beta'
      }
    }
  ]
  const page = await setupPage({ path: '/', frontmatter }, { enhancers })

  expect(page.frontmatter.title).toBe('beta')
})

test('markdown page - pointing to a markdown file', async () => {
  const { relative, filePath } = getDocument('README.md')
  const markdown = getMarkdown()
  const page = await setupPage({ filePath, relative }, { markdown })

  expect(page._filePath).toBe(filePath)
  expect(page.regularPath).toBe('/')
  expect(page.path).toBe('/')
  expect(page.frontmatter).toEqual({})

  const content = await readFile(filePath)

  expect(page._content).toBe(content)
  expect(page._strippedContent).toBe(content)
})

test('markdown page - pointing to a markdown file with frontmatter', async () => {
  const { relative, filePath } = getDocument('alpha.md')
  const title = 'VuePress Alpha' // from fixture
  const markdown = getMarkdown()
  const page = await setupPage({ filePath, relative }, { markdown })

  expect(page._filePath).toBe(filePath)
  expect(page.regularPath).toBe('/alpha.html')
  expect(page.path).toBe('/alpha.html')
  expect(page.frontmatter.title).toBe(title)
  expect(page._content.startsWith('---')).toBe(true)
  expect(page._strippedContent.startsWith('---')).toBe(false)
})

test('enhancer - should loop over sync enhancers', async () => {
  const page = await setupPage({ path: '/' })
  const enhancers = [
    {
      name: 'foo',
      value: jest.fn()
    },
    {
      name: 'foo',
      value: jest.fn()
    }
  ]
  await page.enhance(enhancers)

  return enhancers.map(enhancer => expect(enhancer.value).toHaveBeenCalled())
})

test('enhancer - should loop over sync and async enhancers', async () => {
  const page = await setupPage({ path: '/' })
  const enhancers = [
    {
      name: 'foo',
      value: jest.fn()
    },
    {
      name: 'foo',
      value: jest.fn()
    }
  ]
  const mixedEnhancers = [...enhancers, {
    name: 'blog',
    value: jest.fn().mockResolvedValue({})
  }]
  await page.enhance(mixedEnhancers)

  return mixedEnhancers.map(enhancer => expect(enhancer.value).toHaveBeenCalled())
})

test('enhancer - should log and throw an error when enhancing fails', async () => {
  global.console.log = jest.fn()
  const pluginName = 'error-plugin'

  const page = await setupPage({ path: '/' })
  const error = { errorMessage: 'this is an error message' }

  await expect(page.enhance([{
    name: pluginName,
    value: jest.fn().mockRejectedValue(error)
  }])).rejects.toThrowError(`[${pluginName}] execute extendPageData failed.`)

  expect(console.log).toHaveBeenCalledWith(error)
  // TODO should throw error
})

// TODO Permalink
// TODO Title
// TODO I18n
// TODO Meta
// TODO Add a page with explicit content
// TODO Excerpt
// TODO SFC
// TODO Headers

// TODO get date
// TODO get strippedFilename
// TODO get slug
// TODO get filename
// TODO get dirname
