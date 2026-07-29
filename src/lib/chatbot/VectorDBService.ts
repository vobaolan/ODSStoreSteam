import { createClient } from '@supabase/supabase-js';
import { Logger } from './Logger';

export class VectorDBService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // Using service role key is better for backend if available, but anon key works for now if RLS is configured.
    // Assuming the user will run the SQL to create the table and disable RLS or set proper policies.
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async addDocuments(ids: string[], embeddings: number[][], metadatas: any[], documents: string[]) {
    try {
      const records = ids.map((id, index) => ({
        id,
        content: documents[index],
        metadata: metadatas[index],
        embedding: embeddings[index],
      }));

      // Upsert into Supabase table 'website_documents'
      const { error } = await this.supabase
        .from('website_documents')
        .upsert(records, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      Logger.info(`Upserted ${ids.length} documents into Supabase Vector DB.`);
    } catch (error) {
      Logger.error('Error adding documents to Supabase', error);
      throw error;
    }
  }

  async queryDocuments(queryEmbedding: number[], nResults: number = 3): Promise<any> {
    try {
      // Call the match_website_documents RPC function
      const { data, error } = await this.supabase.rpc('match_website_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // adjust this threshold as needed
        match_count: nResults,
      });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return { documents: [], metadatas: [] };
      }

      return {
        documents: [data.map((row: any) => row.content)],
        metadatas: [data.map((row: any) => row.metadata)],
      };
    } catch (error) {
      Logger.error('Error querying documents from Supabase', error);
      throw error;
    }
  }
}

export const vectorDBService = new VectorDBService();
