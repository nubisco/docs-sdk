import { describe, expect, it } from 'vitest'
import { resolveSidebar } from '../src/theme/sidebar'

const users = [{ text: 'Using', items: [{ text: 'Intro', link: '/users/' }] }]
const developers = [
  { text: 'Run', items: [{ text: 'Install', link: '/developers/install' }] },
]

describe('resolveSidebar', () => {
  it('returns a plain list as it is', () => {
    expect(resolveSidebar(users, '/anything')).toBe(users)
  })

  it('picks the section whose prefix matches the page', () => {
    const sidebar = { '/users/': users, '/developers/': developers }
    expect(resolveSidebar(sidebar, '/developers/install')).toBe(developers)
    expect(resolveSidebar(sidebar, '/users/')).toBe(users)
  })

  it('prefers the longest prefix, with "/" as the fallback', () => {
    const sidebar = { '/': users, '/guide/plugin': developers }
    expect(resolveSidebar(sidebar, '/guide/plugin-api')).toBe(developers)
    expect(resolveSidebar(sidebar, '/guide/concepts')).toBe(users)
  })

  it('reads the items form and gives nothing when nothing matches', () => {
    expect(resolveSidebar({ '/a/': { items: users } }, '/a/x')).toBe(users)
    expect(resolveSidebar({ '/a/': users }, '/b/')).toEqual([])
    expect(resolveSidebar(undefined, '/a/')).toEqual([])
  })
})
