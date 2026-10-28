// The theme's Vue files are compiled by VitePress, not by tsc. This only lets
// the Node-side type check see their default export.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
