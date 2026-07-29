import cron from 'node-cron';
import { crawlerService } from './CrawlerService';
import { Logger } from './Logger';

export class Scheduler {
  /**
   * Initializes the scheduler for auto-indexing the website
   */
  start() {
    // Run immediately on startup
    setTimeout(async () => {
      Logger.info('Running initial website indexing on startup...');
      try {
        await crawlerService.indexWebsite();
      } catch (error) {
        Logger.error('Initial indexing failed', error);
      }
    }, 5000); // Wait 5s for server to fully initialize

    // Schedule to run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      Logger.info('Running scheduled website indexing...');
      try {
        await crawlerService.indexWebsite();
      } catch (error) {
        Logger.error('Scheduled indexing failed', error);
      }
    });
    
    Logger.info('Scheduler started. Website indexing will run every 30 minutes.');
  }
}

export const scheduler = new Scheduler();
