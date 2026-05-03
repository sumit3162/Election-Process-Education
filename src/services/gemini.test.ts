import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askElectionAssistant } from './gemini';

// Mock the GoogleGenAI library
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: 'Mocked Gemini Response'
          })
        }
      };
    })
  };
});

// We have to reset module registry to mock env variables cleanly
describe('askElectionAssistant', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test_key');
  });

  it('throws an error if API key is missing', async () => {
    import.meta.env.VITE_GEMINI_API_KEY = '';
    
    // Dynamically re-import so the top-level init block runs again with empty key
    const module = await import('./gemini');
    await expect(module.askElectionAssistant('test')).rejects.toThrow('Gemini API key is not configured.');
  });
});
