import { ref, Ref } from 'vue'
interface IParam {
  count: number
}
interface IReturn {
  count: Ref
  inc: () => void
}
export const test = (param: IParam): IReturn => {
  const count = ref(param.count)
  const inc = () => {
    count.value++
  }
  return { count, inc }
}
