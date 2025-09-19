import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class EmbeddingsService {
  /**
   * Generate embeddings for text chunks
   */
  static async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      console.log(`Generating embeddings for ${texts.length} texts using model: text-embedding-3-large`);
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-large', // This model supports configurable dimensions
        input: texts,
        dimensions: 1024, // Specify 1024 dimensions to match your index
      });

      const embeddings = response.data.map(item => item.embedding);
      console.log(`Generated ${embeddings.length} embeddings, first embedding dimensions: ${embeddings[0]?.length}`);
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    if (!embeddings[0]) {
      throw new Error('Failed to generate embedding for text');
    }
    return embeddings[0];
  }

  /**
   * Generate embedding for phone number search
   */
  static async generatePhoneEmbedding(phoneNumber: string): Promise<number[]> {
    // Create a search-friendly text for phone numbers
    const searchText = `phone number ${phoneNumber} contact information customer`;
    return this.generateEmbedding(searchText);
  }
}
