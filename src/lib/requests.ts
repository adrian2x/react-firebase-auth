import { SESSION_TOKEN_KEY } from './firebase'
export const BASE_API_URL = '/api'

export function request<TResponse = {}>(
  endpoint: string,
  { body, ...customConfig }: RequestInit = {}
) {
  const config: any = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...customConfig.headers
    }
  }
  if (body) {
    config.body = JSON.stringify(body)
  }
  return window.fetch(`${BASE_API_URL}${endpoint}`, config).then(async (response) => {
    if (response.ok) {
      return (await response.json()) as TResponse
    } else {
      const errorMessage = await response.text()
      return Promise.reject(new Error(errorMessage))
    }
  })
}

request.get = <T>(url: string) => request<T>(url)

request.post = <T>(url: string, body: any, customConfig: RequestInit = {}) =>
  request<T>(url, { body, ...customConfig })

request.delete = <T>(url: string, body = undefined, customConfig: RequestInit = {}) =>
  request<T>(url, {
    body,
    method: 'DELETE',
    ...customConfig
  })

function useAuthToken() {
  const token = window.localStorage.getItem(SESSION_TOKEN_KEY)
  const headers = {} as any
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export function createUser(body: any) {
  return request.post('/users', body, {
    headers: useAuthToken()
  })
}
