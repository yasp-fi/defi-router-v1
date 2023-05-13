import { getReasonPhrase } from 'http-status-codes'
import fetch, { RequestInit } from 'node-fetch'

export class RequestError extends Error {
  method?: string
  responseCode?: string
  responseTextOrJson?: Record<string, unknown>

  constructor(public url: string, message: string) {
    super()

    this.name = 'RequestError'
    this.message = `${url}: ${message}`

    Error.captureStackTrace(this, RequestError)
  }

  static isRequestError(e: unknown): e is RequestError {
    if (e instanceof RequestError) return true

    return (
      typeof e === 'object' &&
      e !== null &&
      'responseTextOrJson' in e &&
      'code' in e &&
      'method' in e &&
      'url' in e
    )
  }
}

export async function safeFetch(
  url: string,
  options: RequestInit = {}
) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    let errorContent

    try {
      errorContent = JSON.parse(errorText)
    } catch (e) {
      errorContent = errorText
    }

    const requestError = new RequestError(
      response.url,
      getReasonPhrase(response.status.toString())
    )

    requestError.responseTextOrJson = errorContent
    requestError.responseCode = response.status.toString()
    requestError.method = options.method?.toString()

    throw requestError
  }

  return response
}
