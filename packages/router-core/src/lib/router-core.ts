import { z } from 'zod'
import ms from 'ms';
import BN from 'bn.js';


export const priceQuoteTypes = ['fiat', 'crypto'] as const
export type PriceQuoteType = typeof priceQuoteTypes[number]
export type BigNumberLike = BN | string | number | bigint


export enum EVMChainIds {
  ETH = 1,
  MATIC = 137,
  xDAI = 100,
  OPTIMISM = 10,
}

export enum EVMChainNativeTickerSymbol {
  Polygon = 'MATIC',
  Optimism = 'OP',
  xDAI = 'GNO',
  Ethereum = 'ETH',
  zkEVM = 'ZK_EVM',
}

export const PriceFeedQuotePropsSchema = z.object({
  id: z.string(),
  value: z.string(),
  symbol: z.string(),
  providerSlug: z.string(),
  priceQuoteType: z.enum(priceQuoteTypes),
  contractAddress: z.string().optional(),
  expiry: z.number().optional(),
})

export type PriceFeedQuoteProps = z.infer<typeof PriceFeedQuotePropsSchema>

export class PriceFeedQuote {

  id: string
  value: string
  symbol: string
  providerSlug: string
  priceQuoteType: PriceQuoteType

  contractAddress?: string
  expiry?: number

  constructor(
    props: PriceFeedQuoteProps
  ) {
    this.id = props.id
    this.value = props.value
    this.symbol = props.symbol
    this.providerSlug = props.providerSlug
    this.priceQuoteType = props.priceQuoteType
    this.contractAddress = props.contractAddress
    this.expiry = props.expiry ?? Date.now() + ms('5m')
  }

  static isPriceFeedQuote(e: unknown): e is PriceFeedQuote {
    return (
      typeof e === 'object' &&
      e !== null &&
      'id' in e &&
      'value' in e &&
      'symbol' in e &&
      'providerSlug' in e
    )
  }
}


export abstract class PriceFeedProvider {
  abstract readonly providerSlug: string;

  abstract forAllPriceFeedQuotes(): Promise<PriceFeedQuote[]>
}
