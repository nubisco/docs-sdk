/**
 * The sidebar for a page. `themeConfig.sidebar` is either one list or an
 * object keyed by path prefix (one list per audience), and the longest prefix
 * that matches the page wins, as it does in VitePress itself.
 */
export function resolveSidebar(sidebar: unknown, path: string): any[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar
  const sections = sidebar as Record<string, any>
  const key = Object.keys(sections)
    .filter((k) => path.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  const entry = key ? sections[key] : undefined
  return Array.isArray(entry) ? entry : (entry?.items ?? [])
}
