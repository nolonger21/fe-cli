// import vue from 'vue'

// console.info(vue)
// import './index2'

interface IMap {
  a: string
  b?: number
}
const map: IMap = {
  a: '1',
  b: 2,
}
const wer: IMapd = {
  a: 'a',
}

const x: string[] = ['a', 'b']
const y: readonly string[] = ['a', 'b']

x.push('c')

const fff = { ...wer }

console.info(fff)

if (wer === wer) {
  const _a = 2
  console.info(map)
}

;(window as any).a = {
  a: 1,
}

Array<number>(0, 1, 2)
const newArr = new Array<number>(1, 2, 3)

const xx: string[] = ['a', 'b']
const yy: readonly string[] = ['a', 'b']

type Foo = new () => void

interface Fo {
  bar: number
  (): void
}

const hhh = 5
const sdfsdfb = hhh

interface IReturn {
  a: number
}

function myFunc(arg: string): IReturn {
  if (!arg) {
    return { a: 2 }
  }
  return { a: 1 }
}

const str = ''
const params = ''
myFunc(params)
if (typeof str === 'string') {
  myFunc(str)
}

const [ hello ]: number[] = [1]

const foo = 3 as number

const abc = {
  a: 1,
}

function qq (haa: any) {
  console.info(haa)
  return 1
}

debugger