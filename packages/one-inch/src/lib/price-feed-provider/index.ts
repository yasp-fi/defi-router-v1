import { EVMChainNativeTickerSymbol, EVMChainIds, PriceFeedQuote, PriceFeedProvider } from "@yasp/router-core";

import OneInchOracleABI from './abi/1inchOracle.json';
import {safeFetch} from "@yasp/utils";
import {InchTokensByAddressResponse} from "./types";
import {batchMultiCall, createEVMPublicClient} from "@yasp/evm";
import {PublicClient} from "viem";

export const OneInchOracles: Partial<Record<EVMChainNativeTickerSymbol, string>> = {
  [EVMChainNativeTickerSymbol.Ethereum]: '0x07D91f5fb9Bf7798734C3f606dB065549F6893bb',
  [EVMChainNativeTickerSymbol.Optimism]: '0x11DEE30E710B8d4a8630392781Cc3c0046365d4c',
  [EVMChainNativeTickerSymbol.xDAI]: '0x3Ce81621e674Db129033548CbB9FF31AEDCc1BF6',
  [EVMChainNativeTickerSymbol.Polygon]: '0x7F069df72b7A39bCE9806e3AfaF579E54D8CF2b9',
}


export const INCH_SWAP_URL = 'https://api.1inch.io/v5.0'
export const INCH_MATCHING_STABLECOINS_TICKERS = [
  'USDC',
  'USDT',
  'DAI'
]

export class OneInchPriceFeedProvider implements PriceFeedProvider {
  readonly providerSlug: string = '1inch-oracle';

  readonly oracleContractAddress: string;
  readonly viemClient: PublicClient;

  constructor(
    public chainNativeTickerSymbol: EVMChainNativeTickerSymbol,
    public chainId: EVMChainIds,
  ) {
    const oracleContractAddress = OneInchOracles[chainNativeTickerSymbol];

    if (!oracleContractAddress) {
      throw new Error(`No 1inch oracle contract address found for ${chainNativeTickerSymbol}`);
    }

    this.oracleContractAddress = oracleContractAddress;

    this.viemClient = createEVMPublicClient(
      this.chainNativeTickerSymbol
    )
  }

  async forAllPriceFeedQuotes(): Promise<PriceFeedQuote[]> {
    const supportedTokens = await this.#forOneInchSupportedTokens();
    const stableCoinToken = supportedTokens.find(
      (inchToken) => INCH_MATCHING_STABLECOINS_TICKERS.includes(inchToken.symbol)
    );

    if (!stableCoinToken) {
      console.warn('No stable coin token found for 1inch oracle within', this.chainNativeTickerSymbol);
      return [];
    }

    const multiCallPayloads = []

    for (const supportedToken of supportedTokens) {
      if (supportedToken.symbol !== stableCoinToken.symbol) {
        multiCallPayloads.push(this.#forOracleContractCallPayloadAdapt(
          stableCoinToken.address,
          supportedToken.address,
        ));
      } else {
        continue
      }
    }


    const responses = await batchMultiCall.bind(this.viemClient)({
      contracts: multiCallPayloads,
    });

    console.info('1inch Response: ', responses)


    return responses as any[];
  }



  #generateAPIEndpoint(subPath: string): string {
    return `${INCH_SWAP_URL}/${this.chainId}/${subPath}`
  }


  async #forOneInchSupportedTokens(): Promise<any[]> {
    const apiCallURL = this.#generateAPIEndpoint('tokens');


    const response = await safeFetch(apiCallURL, {
      method: 'GET'
    });

    const json = await response.json() as InchTokensByAddressResponse;

    return Object.values(json?.tokens ?? {});
  }

  #forOracleContractCallPayloadAdapt(
    fromAddress: string,
    toAddress: string,
  ) {
    return {
      address: this.oracleContractAddress,
      abi: OneInchOracleABI,
      functionName: 'getRate',
      chainId: this.chainId,
      args: [
        fromAddress,
        toAddress,
        false,
      ]
    }
  }
}
