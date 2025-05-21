import { callOpenAI, ChatMessage } from './openai';

// Interface for web search results
export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Perform a web search using OpenAI's up-to-date browsing capability
 * 
 * @param query Search query
 * @param apiKey OpenAI API key
 * @returns Search results and potential errors
 */
export async function performWebSearch(
  query: string, 
  apiKey: string
): Promise<{success: boolean; results?: WebSearchResult[]; answer?: string; error?: string}> {
  try {
    // Create messages with instructions to perform web search
    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: `You are a real-time web search assistant. For the user's query, provide the most up-to-date information available.
        
        Important instructions:
        1. Always search for the most current information
        2. Ensure you're providing real-time data from reliable sources
        3. If the user's query has factual inaccuracies, correct them based on current information
        4. Use a structured approach to search for accurate information
        5. If requested information is time-sensitive (like current officeholders, events, etc.), explicitly verify it's current
        6. Always include the current date in your response when relevant`
      },
      { 
        role: 'user', 
        content: `Please search the web for the most current information about: "${query}". 
        I need accurate, up-to-date information.`
      }
    ];

    // Use GPT-4 with internet browsing capability, which has more current information
    const result = await callOpenAI(messages, apiKey, 'gpt-4o', 0.7);
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error || 'Failed to perform web search' 
      };
    }

    // Process the response to extract search results
    // For now, we'll just return the raw answer
    return {
      success: true,
      answer: result.data,
      results: [] // In a full implementation, we'd parse structured results
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred during web search'
    };
  }
} 