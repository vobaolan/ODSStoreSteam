import * as cheerio from 'cheerio';
import { Logger } from './Logger';
import { embeddingService } from './EmbeddingService';
import { vectorDBService } from './VectorDBService';

export class CrawlerService {
  private baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  private ignoredPaths = ['/login', '/admin', '/dashboard', '/logout', '/api', '/_next'];
  private chunkSize = 800; // 700-1000 characters
  private chunkOverlap = 150;

  async indexWebsite() {
    Logger.info('Starting website indexing...');
    try {
      // In a real scenario, we would parse sitemap.xml.
      // For this implementation, we will simulate crawling a few primary paths.
      // A robust crawler would use a queue and visit all internal links.
      const pathsToCrawl = [
        '/', 
        '/about', 
        '/contact', 
        '/services', 
        '/policies/faq',
        '/policies/warranty',
        '/policies/privacy'
      ];
      
      for (const path of pathsToCrawl) {
        if (this.ignoredPaths.some(ignored => path.startsWith(ignored))) continue;
        
        await this.crawlAndIndexPage(path);
      }
      
      Logger.info('Website indexing completed successfully.');
    } catch (error) {
      Logger.error('Failed to index website', error);
    }
  }

  private async crawlAndIndexPage(path: string) {
    const url = `${this.baseUrl}${path}`;
    try {
      const response = await fetch(url);
      if (!response.ok) return;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, nav, footer, header').remove();

      // Extract text
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      
      if (text.length === 0) return;

      // Chunking
      const chunks = this.chunkText(text, this.chunkSize, this.chunkOverlap);
      
      if (chunks.length === 0) return;

      // Embeddings
      const embeddings = await embeddingService.generateEmbeddings(chunks);

      // Prepare data for ChromaDB
      const ids = chunks.map((_, i) => `${path}_chunk_${i}`);
      const metadatas = chunks.map(() => ({ source: path }));

      // Insert into VectorDB
      await vectorDBService.addDocuments(ids, embeddings, metadatas, chunks);
      
      Logger.info(`Indexed page ${url} with ${chunks.length} chunks.`);

    } catch (error) {
      Logger.error(`Error crawling page ${url}`, error);
    }
  }

  private chunkText(text: string, size: number, overlap: number): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      chunks.push(text.slice(i, i + size));
      i += size - overlap;
    }
    return chunks;
  }
}

export const crawlerService = new CrawlerService();
