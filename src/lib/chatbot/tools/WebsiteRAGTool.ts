import { BaseTool } from './BaseTool';
import { embeddingService } from '../EmbeddingService';
import { vectorDBService } from '../VectorDBService';

export class WebsiteRAGTool extends BaseTool {
  name = 'website_rag';
  description = 'Search the website for information about services, registration, products, refund policies, contact info, etc. Use this tool for any questions related to the website.';
  parameters = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to find information on the website.',
      },
    },
    required: ['query'],
  };

  async execute(args: { query: string }): Promise<any> {
    try {
      // 1. Embed the user query
      const queryEmbedding = await embeddingService.generateEmbedding(args.query);

      // 2. Query Vector DB (Top-K Retrieval)
      const results = await vectorDBService.queryDocuments(queryEmbedding, 3); // top 3

      if (!results.documents || results.documents.length === 0 || results.documents[0].length === 0) {
        return {
          context: 'No relevant information found on the website.',
          documents: []
        };
      }

      // Format context
      const context = results.documents[0].join('\n\n---\n\n');
      const documents = results.metadatas[0];

      return {
        context,
        documents
      };

    } catch (error: any) {
      return { error: `Failed to retrieve website information: ${error.message}` };
    }
  }
}
