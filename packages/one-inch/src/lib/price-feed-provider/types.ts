export type InchToken = {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI: string
  tags: string[]
}

export type InchTokensByAddressResponse = {
  tokens: {
    [key: string]: InchToken
  }
}

export type InchQuoteRequest = {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  gasPrice: string
  fee?: string
}

export type InchSwapRequest = {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  // user address
  fromAddress: string
  slippage: number
  disableEstimate?: boolean
  fee?: string
  allowPartialFill?: boolean
  gasPrice?: string
  gasLimit?: number
  referrerAddress?: string
}

