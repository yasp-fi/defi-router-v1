import { createPublicClient, http, MulticallParameters, PublicClient } from 'viem';
import { mainnet, polygon, gnosis, optimism } from 'viem/chains'
import { chunk } from 'lodash';
import { EVMChainNativeTickerSymbol } from "@yasp/router-core";


const publicClientsViewChains: Partial<Record<EVMChainNativeTickerSymbol, any>> = {
  [EVMChainNativeTickerSymbol.Ethereum]: mainnet,
  [EVMChainNativeTickerSymbol.Polygon]: polygon,
  [EVMChainNativeTickerSymbol.Optimism]: optimism,
  [EVMChainNativeTickerSymbol.xDAI]: gnosis,
}

export function createEVMPublicClient(
  chainNativeTickerSymbol: EVMChainNativeTickerSymbol,
) {

  const viewChain = publicClientsViewChains[chainNativeTickerSymbol];

  if (!viewChain) {
    throw new Error(`No view chain found for ${chainNativeTickerSymbol}`);
  }

  return createPublicClient({
    chain: viewChain,
    transport: http(),
  })
}


export async function batchMultiCall(
  this: PublicClient,
  payloads: MulticallParameters<any, any>,
  chunkSize = 16,
) {
  const response = [];
  for (const _chunk of chunk(payloads.contracts, chunkSize)) {
    const processed = await this.multicall({ contracts: _chunk });
    response.push(processed);
  }

  return response.flat();
}
