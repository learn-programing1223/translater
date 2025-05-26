import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { catalogService } from '@/lib/db/catalog';
import { streamChat } from '@/lib/ai/openai';

export const chatRouter = router({
  searchProducts: publicProcedure
    .input(z.object({
      query: z.string(),
      language: z.string(),
    }))
    .query(async ({ input }) => {
      return await catalogService.searchProducts(input.query, input.language);
    }),

  sendMessage: publicProcedure
    .input(z.object({
      message: z.string(),
      language: z.string(),
    }))
    .mutation(async ({ input }) => {
      const products = await catalogService.searchProducts(input.message, input.language);
      
      // Note: In a real implementation, this would handle streaming properly
      // For now, we'll return a placeholder response
      return {
        response: `Processing your query about: ${input.message}`,
        products,
      };
    }),
});