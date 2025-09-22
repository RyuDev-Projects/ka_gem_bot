import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private systemPrompt: string;

  constructor() {
    console.log('🔧 Initializing Gemini service...');
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    this.systemPrompt = config.gemini.systemPrompt;
    console.log('✅ Gemini service initialized successfully');
    console.log(`🎭 System prompt loaded (${this.systemPrompt.length} characters)`);
  }

  private buildPrompt(userMessage: string, context?: string): string {
    let fullPrompt = this.systemPrompt;

    if (context) {
      fullPrompt += `\n\nContext: ${context}`;
    }

    fullPrompt += `\n\nUser: ${userMessage}`;

    return fullPrompt;
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = this.buildPrompt(prompt, context);

      console.log('🤖 Sending request to Gemini API...');
      console.log(`📝 User prompt: ${prompt.substring(0, 100)}...`);
      if (context) {
        console.log(`📋 Context: ${context.substring(0, 50)}...`);
      }

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Received response from Gemini API');
      console.log(`📄 Response length: ${text.length} characters`);

      return text || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
    } catch (error) {
      console.error('❌ Error generating response from Gemini:', error);

      // More specific error handling
      if (error instanceof Error) {
        console.error(`❌ Error message: ${error.message}`);
        if (error.message.includes('API_KEY')) {
          return 'Error: API key tidak valid. Silakan periksa konfigurasi Gemini API key.';
        }
        if (error.message.includes('quota')) {
          return 'Error: Quota API Gemini telah habis. Silakan coba lagi nanti.';
        }
      }

      return 'Maaf, terjadi kesalahan saat memproses permintaan Anda.';
    }
  }

  async generateGroupResponse(message: string, username: string): Promise<string> {
    const context = `This is a group chat message from ${username}. Respond appropriately to the group context. Keep responses concise and engaging for group conversation.`;
    return this.generateResponse(message, context);
  }

  // Method to get current system prompt
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  // Method to temporarily override system prompt (useful for testing)
  setSystemPrompt(newPrompt: string): void {
    this.systemPrompt = newPrompt;
    console.log(`🎭 System prompt updated (${newPrompt.length} characters)`);
  }

  // Method to reset to default system prompt
  resetSystemPrompt(): void {
    this.systemPrompt = config.gemini.systemPrompt;
    console.log('🔄 System prompt reset to default');
  }
}