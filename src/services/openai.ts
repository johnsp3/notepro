import { Note } from '../types';
import { getOptionalEnvVar } from '../utils/env';

// Interface for OpenAI API response
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  created: number;
  id: string;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Interface for chat messages
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Function to call OpenAI API
export async function callOpenAI(
  messages: ChatMessage[],
  apiKey: string | null = null,
  model: string = 'gpt-4o',
  temperature: number = 0.7
): Promise<{success: boolean; data?: string; error?: string; debug?: any}> {
  try {
    console.log('[OpenAI Service] Calling API with messages:', messages);
    
    // Get API key from parameter or environment variables
    const effectiveApiKey = apiKey || getOptionalEnvVar('REACT_APP_OPENAI_API_KEY');
    
    // Ensure API key is provided
    if (!effectiveApiKey) {
      console.error('[OpenAI Service] No API key provided');
      return { success: false, error: 'API key is required. Please add your API key in settings or configure it in the environment.' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveApiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[OpenAI Service] API error:', errorData);
      return { 
        success: false, 
        error: errorData.error?.message || 'Failed to communicate with OpenAI API',
        debug: errorData 
      };
    }

    const data: OpenAIResponse = await response.json();
    console.log('[OpenAI Service] API response:', data);
    
    return { 
      success: true, 
      data: data.choices[0].message.content,
      debug: {
        usage: data.usage,
        model: data.model,
        id: data.id
      }
    };
  } catch (error) {
    console.error('[OpenAI Service] Error calling OpenAI API:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      debug: error 
    };
  }
}

// Function to process note content with OpenAI
export async function processNoteWithAI(
  note: Note,
  instruction: string,
  apiKey: string | null = null,
  model: string = 'gpt-4o'
): Promise<{success: boolean; content?: string; error?: string}> {
  // Combine text blocks for processing
  const textContent = note.content
    .filter(block => block.type === 'text')
    .map(block => (block as any).content)
    .join('\n\n');

  const messages: ChatMessage[] = [
    { 
      role: 'system', 
      content: 'You are an AI assistant helping with note editing. You will be given note content and instructions on how to modify it. Return ONLY the modified content without explanations or additional text.'
    },
    { 
      role: 'user', 
      content: `Here is my note content:\n\n${textContent}\n\nInstruction: ${instruction}\n\nModify the content based on the instruction and return only the result.`
    }
  ];

  const result = await callOpenAI(messages, apiKey, model);
  return {
    success: result.success,
    content: result.data,
    error: result.error
  };
} 