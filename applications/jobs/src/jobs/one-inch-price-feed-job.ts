import { OneInchPriceFeedProvider } from "@yasp/one-inch";
import { EVMChainIds, EVMChainNativeTickerSymbol } from "@yasp/router-core";
import { getRedisClient } from '@yasp/utils'

const ethereumPriceFeed = new OneInchPriceFeedProvider(
  EVMChainNativeTickerSymbol.Ethereum,
  EVMChainIds.ETH
);

const optimismPriceFeed = new OneInchPriceFeedProvider(
  EVMChainNativeTickerSymbol.Optimism,
  EVMChainIds.OPTIMISM
);

const xDaiPriceFeed = new OneInchPriceFeedProvider(
  EVMChainNativeTickerSymbol.xDAI,
  EVMChainIds.xDAI,
);

const polygonPriceFeed = new OneInchPriceFeedProvider(
  EVMChainNativeTickerSymbol.Polygon,
  EVMChainIds.MATIC,
);

const runPriceFeed = async (priceFeedProvider: OneInchPriceFeedProvider) => {
  const priceFeedQuotes = priceFeedProvider.forAllPriceFeedQuotes();
  const {providerSlug, chainNativeTickerSymbol} = priceFeedProvider;
  const temporaryStorageKey = `${providerSlug}:${chainNativeTickerSymbol}`;


  const redisClient = getRedisClient(
    process.env.REDIS_HOST,
  );

  await redisClient.set(
    temporaryStorageKey,
    JSON.stringify(priceFeedQuotes),
  )
}

export async function startOneInchPriceFeedJob() {
  runPriceFeed(ethereumPriceFeed).catch(console.error);
  runPriceFeed(optimismPriceFeed).catch(console.error);
  runPriceFeed(xDaiPriceFeed).catch(console.error);
  runPriceFeed(polygonPriceFeed).catch(console.error);
}
