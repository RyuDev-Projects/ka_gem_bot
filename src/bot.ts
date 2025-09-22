import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { GeminiService } from './gemini';

export class TelegramBotHandler {
  private bot: TelegramBot;
  private gemini: GeminiService;
  private readonly MAX_MESSAGE_LENGTH = 4096;

  constructor() {
    this.bot = new TelegramBot(config.telegram.token, { polling: true });
    this.gemini = new GeminiService();
    this.setupHandlers();
  }

  // Helper function to split long messages
  private splitMessage(text: string): string[] {
    if (text.length <= this.MAX_MESSAGE_LENGTH) {
      return [text];
    }

    const chunks: string[] = [];
    let currentChunk = '';

    // Split by paragraphs first
    const paragraphs = text.split('\n\n');

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed limit
      if ((currentChunk + '\n\n' + paragraph).length > this.MAX_MESSAGE_LENGTH) {
        // If current chunk is not empty, save it
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        // If paragraph itself is too long, split by sentences
        if (paragraph.length > this.MAX_MESSAGE_LENGTH) {
          const sentences = paragraph.split('. ');
          for (const sentence of sentences) {
            if ((currentChunk + '. ' + sentence).length > this.MAX_MESSAGE_LENGTH) {
              if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
              }
              // If sentence is still too long, force split
              if (sentence.length > this.MAX_MESSAGE_LENGTH) {
                const words = sentence.split(' ');
                for (const word of words) {
                  if ((currentChunk + ' ' + word).length > this.MAX_MESSAGE_LENGTH) {
                    if (currentChunk.trim()) {
                      chunks.push(currentChunk.trim());
                      currentChunk = word;
                    }
                  } else {
                    currentChunk += (currentChunk ? ' ' : '') + word;
                  }
                }
              } else {
                currentChunk = sentence;
              }
            } else {
              currentChunk += (currentChunk ? '. ' : '') + sentence;
            }
          }
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    // Add remaining chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text.substring(0, this.MAX_MESSAGE_LENGTH)];
  }

  // Helper function to send long messages
  private async sendLongMessage(chatId: number, text: string, options?: any): Promise<void> {
    const chunks = this.splitMessage(text);

    console.log(`📄 Message split into ${chunks.length} parts`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isLast = i === chunks.length - 1;

      // Add part indicator for multi-part messages
      const finalChunk = chunks.length > 1 ?
        `${chunk}\n\n📄 (${i + 1}/${chunks.length})` : chunk;

      // Only apply original options to the last message
      const messageOptions = isLast ? options : {};

      await this.bot.sendMessage(chatId, finalChunk, messageOptions);

      // Small delay between messages to avoid rate limiting
      if (!isLast) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  private setupHandlers(): void {
    console.log('🔧 Setting up bot handlers...');

    // Handle ALL messages in a single handler
    this.bot.on('message', async (msg) => {
      try {
        console.log(`📥 Received message: ${JSON.stringify({
          chatType: msg.chat.type,
          chatId: msg.chat.id,
          from: msg.from?.first_name,
          text: msg.text?.substring(0, 50) + '...'
        })}`);

        if (msg.chat.type === 'private') {
          await this.handleDirectMessage(msg);
        } else {
          await this.handleGroupMessage(msg);
        }
      } catch (error) {
        console.error('❌ Error in message handler:', error);
      }
    });

    // Handle errors
    this.bot.on('error', (error) => {
      console.error('❌ Telegram bot error:', error);
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      console.error('❌ Polling error:', error);
    });

    console.log('🤖 Bot is running and waiting for messages...');
  }

  private async handleDirectMessage(msg: TelegramBot.Message): Promise<void> {
    if (!msg.text) {
      console.log('⚠️ No text in direct message, skipping...');
      return;
    }

    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';

    console.log(`📨 Direct message from ${userName}: ${msg.text}`);

    try {
      // Send typing indicator
      await this.bot.sendChatAction(chatId, 'typing');

      // Generate response using Gemini
      console.log('🔄 Generating response with Gemini...');
      const response = await this.gemini.generateResponse(msg.text);
      console.log(`💬 Generated response: ${response.substring(0, 50)}... (${response.length} chars)`);

      // Send response (will automatically split if too long)
      await this.sendLongMessage(chatId, response);
      console.log('✅ Response sent successfully');
    } catch (error) {
      console.error('❌ Error handling direct message:', error);
      await this.sendLongMessage(
        chatId,
        'Maaf, terjadi kesalahan saat memproses pesan Anda.'
      );
    }
  }

  private async handleGroupMessage(msg: TelegramBot.Message): Promise<void> {
    if (!msg.text) {
      console.log('⚠️ No text in group message, skipping...');
      return;
    }

    const chatId = msg.chat.id;
    const userName = msg.from?.first_name || 'User';
    const botUsername = config.telegram.username;

    console.log(`👥 Group message from ${userName} in ${msg.chat.title}: ${msg.text}`);
    console.log(`🔍 Bot username configured: @${botUsername}`);

    // Enhanced mention detection
    const botUsernameUpper = botUsername.toUpperCase();
    const messageUpper = msg.text.toUpperCase();

    const isMentionedByUsername = messageUpper.includes(`@${botUsernameUpper}`);
    const isReplyToBot = msg.reply_to_message && msg.reply_to_message.from?.is_bot &&
                        msg.reply_to_message.from?.username?.toUpperCase() === botUsernameUpper;

    // Check if message has entities (mentions)
    const hasEntities = msg.entities && msg.entities.length > 0;
    let isMentionedByEntity = false;

    if (hasEntities && msg.entities) {
      console.log(`🏷️ Message entities: ${JSON.stringify(msg.entities)}`);
      // Check if any entity is a mention of this bot
      isMentionedByEntity = msg.entities.some(entity => {
        if (entity.type === 'mention') {
          const mentionText = msg.text!.substring(entity.offset, entity.offset + entity.length);
          console.log(`🔍 Found mention: ${mentionText}`);
          return mentionText.toUpperCase() === `@${botUsernameUpper}`;
        }
        return false;
      });
    }

    const isMentioned = isMentionedByUsername || isReplyToBot || isMentionedByEntity;

    console.log(`🏷️ Mention checks:`);
    console.log(`   - By username: ${isMentionedByUsername}`);
    console.log(`   - Reply to bot: ${isReplyToBot}`);
    console.log(`   - By entity: ${isMentionedByEntity}`);
    console.log(`   - Final result: ${isMentioned}`);

    if (!isMentioned) {
      console.log('⏭️ Bot not mentioned, skipping...');
      return;
    }

    try {
      // Send typing indicator
      await this.bot.sendChatAction(chatId, 'typing');

      // Clean the message (remove bot mention)
      const cleanMessage = msg.text.replace(new RegExp(`@${botUsername}`, 'g'), '').trim();
      console.log(`🧹 Cleaned message: "${cleanMessage}"`);

      // Generate response using Gemini
      console.log('🔄 Generating group response with Gemini...');
      const response = await this.gemini.generateGroupResponse(cleanMessage, userName);
      console.log(`💬 Generated response: ${response.substring(0, 50)}... (${response.length} chars)`);

      // Send response (will automatically split if too long)
      await this.sendLongMessage(chatId, response, {
        reply_to_message_id: msg.message_id,
      });
      console.log('✅ Group response sent successfully');
    } catch (error) {
      console.error('❌ Error handling group message:', error);
      await this.sendLongMessage(
        chatId,
        'Maaf, terjadi kesalahan saat memproses pesan Anda.',
        { reply_to_message_id: msg.message_id }
      );
    }
  }

  public start(): void {
    console.log('🚀 Starting Telegram bot...');
  }

  public stop(): void {
    console.log('🛑 Stopping Telegram bot...');
    this.bot.stopPolling();
  }
}