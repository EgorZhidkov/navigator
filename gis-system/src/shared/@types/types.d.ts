declare module '*.svg' {
  import React = require('react')

  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

interface IUnknownObject {
  [prop: string]: unknown
}

interface IUnknownFunction {
  [prop: string]: () => unknown
}

interface IColors {
  [key: string]: string
}
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

type OptionalRecord<K extends keyof any, T> = {
  [P in K]?: T
}

type TValueOf<T> = T[keyof T]
type TKeyOf<T> = keyof T

type TAnyObject = {
  [key: string]: any
}
type TUnknownFunction = (...args: unknown[]) => unknown
