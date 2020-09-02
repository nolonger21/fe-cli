import axios from 'axios'

export const http = mount => {
  const { router } = mount
  window.axios = axios

  axios.defaults.withCredentials = true

  const service = axios.create({
    baseURL: '',
    timeout: 60000, // request timeout
  })

  const httpRequestSuccess = request => {
    return request
  }

  const httpRequestError = error => Promise.reject(error)

  // 全局统一请求拦截器
  service.interceptors.request.use(httpRequestSuccess, httpRequestError)

  const httpResponseSuccess = response => {
    const res = response.data
    if (res.code !== 0) {
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  }

  const httpResponseError = error => {
    return Promise.reject(error)
  }

  // 全局统一返回拦截器
  service.interceptors.response.use(httpResponseSuccess, httpResponseError)

  return service
}
