import { z } from 'zod';
import { Expert, ExpertSchema } from './Expert';
import expertsData from '../src/data/experts.json';

const ExpertsArraySchema = z.array(ExpertSchema);

class ExpertsRepository {
  private experts: Expert[];

  constructor() {
    // Validate the JSON data against the schema
    const validationResult = ExpertsArraySchema.safeParse(expertsData);
    
    if (!validationResult.success) {
      throw new Error(`Invalid experts data: ${validationResult.error.message}`);
    }
    
    this.experts = validationResult.data;
  }

  /**
   * Get all experts
   */
  list(): Expert[] {
    return [...this.experts]; // Return a copy to prevent mutations
  }

  /**
   * Get expert by ID
   */
  byId(id: string): Expert | undefined {
    return this.experts.find(expert => expert.id === id);
  }

  /**
   * Get the total number of experts
   */
  count(): number {
    return this.experts.length;
  }
}

// Export a singleton instance
export const expertsRepository = new ExpertsRepository();
export { ExpertsRepository };
