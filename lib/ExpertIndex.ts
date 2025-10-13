import fs from 'fs/promises';
import path from 'path';
import { Expert } from './Expert';
import { embedTexts } from '../backend/src/ai/embeddings';
import { cosineSimilarity } from '../backend/src/ai/embeddings';

export interface ExpertIndexEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    name: string;
    role: string;
    dept?: string;
    region?: string;
    seniority?: string;
  };
}

export interface ExpertIndex {
  version: string;
  model: string;
  created: string;
  entries: ExpertIndexEntry[];
}

export interface ExpertSearchResult {
  id: string;
  text: string;
  score: number;
  metadata?: {
    name: string;
    role: string;
    dept?: string;
    region?: string;
    seniority?: string;
  };
}

/**
 * Build expert semantic index from expert data
 * @param experts Array of Expert objects
 * @returns Promise<void>
 */
export async function buildExpertIndex(experts: Expert[]): Promise<void> {
  console.log(`🔨 Building expert index for ${experts.length} experts...`);
  
  // Prepare texts for embedding - combine name, role, bio, skills, and products
  const entries: Omit<ExpertIndexEntry, 'embedding'>[] = experts.map(expert => {
    const textParts = [
      expert.name,
      expert.role,
      expert.bio || '',
      expert.skills.join(' '),
      expert.products.join(' ')
    ].filter(Boolean);
    
    const text = textParts.join(' ').trim();
    
    return {
      id: expert.id,
      text,
      metadata: {
        name: expert.name,
        role: expert.role,
        dept: expert.dept,
        region: expert.region,
        seniority: expert.seniority,
      }
    };
  });

  const texts = entries.map(entry => entry.text);

  try {
    // Generate embeddings in batch
    console.log('🧮 Generating embeddings...');
    const embeddings = await embedTexts(texts);

    if (embeddings.length !== entries.length) {
      throw new Error(`Embedding count mismatch: expected ${entries.length}, got ${embeddings.length}`);
    }

    // Create expert index
    const expertIndex: ExpertIndex = {
      version: '1.0.0',
      model: 'Xenova/all-MiniLM-L6-v2', // Default model from embeddings service
      created: new Date().toISOString(),
      entries: entries.map((entry, i) => ({
        ...entry,
        embedding: embeddings[i]
      }))
    };

    // Ensure data directory exists
    const dataDir = path.resolve('src/data');
    await fs.mkdir(dataDir, { recursive: true });

    // Save index to file
    const indexPath = path.join(dataDir, 'experts_index.json');
    await fs.writeFile(indexPath, JSON.stringify(expertIndex, null, 2), 'utf-8');

    console.log(`✅ Expert index saved to ${indexPath}`);
    console.log(`   ${expertIndex.entries.length} experts indexed`);
    console.log(`   Model: ${expertIndex.model}`);
    console.log(`   Dimensions: ${embeddings[0].length}`);

  } catch (error) {
    console.error('❌ Failed to build expert index:', error);
    throw new Error(`Failed to build expert index: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search experts by semantic similarity
 * @param query Search query
 * @param k Number of results to return (default: 10)
 * @returns Promise<ExpertSearchResult[]>
 */
export async function searchExperts(query: string, k: number = 10): Promise<ExpertSearchResult[]> {
  try {
    // Load expert index
    const indexPath = path.resolve('src/data/experts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const expertIndex: ExpertIndex = JSON.parse(indexData);

    // Generate query embedding
    console.log(`🔍 Searching experts for: "${query}"`);
    const queryEmbedding = await embedTexts([query]);
    const queryVector = queryEmbedding[0];

    // Calculate similarities
    const results: ExpertSearchResult[] = expertIndex.entries.map(entry => {
      const similarity = cosineSimilarity(queryVector, entry.embedding);
      
      return {
        id: entry.id,
        text: entry.text,
        score: similarity,
        metadata: entry.metadata
      };
    });

    // Sort by similarity score (descending) and return top k
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, k);

    console.log(`✅ Found ${topResults.length} expert matches`);
    if (topResults.length > 0) {
      console.log(`   Top result: ${topResults[0].metadata?.name} (score: ${topResults[0].score.toFixed(4)})`);
    }

    return topResults;

  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw new Error('Expert index not found. Please run buildExpertIndex() first.');
    }
    console.error('❌ Failed to search experts:', error);
    throw new Error(`Failed to search experts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if expert index exists and is up to date
 * @returns Promise<boolean>
 */
export async function isExpertIndexAvailable(): Promise<boolean> {
  try {
    const indexPath = path.resolve('src/data/experts_index.json');
    await fs.access(indexPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get expert index statistics
 * @returns Promise<{entries: number, model: string, created: string} | null>
 */
export async function getExpertIndexStats(): Promise<{entries: number, model: string, created: string} | null> {
  try {
    const indexPath = path.resolve('src/data/experts_index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const expertIndex: ExpertIndex = JSON.parse(indexData);
    
    return {
      entries: expertIndex.entries.length,
      model: expertIndex.model,
      created: expertIndex.created
    };
  } catch {
    return null;
  }
}
