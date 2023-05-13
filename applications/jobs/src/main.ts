import cron from 'node-cron';
import { startOneInchPriceFeedJob } from "./jobs/one-inch-price-feed-job";

(async function () {
  cron.schedule('*/1 * * * * *', startOneInchPriceFeedJob);
})();
