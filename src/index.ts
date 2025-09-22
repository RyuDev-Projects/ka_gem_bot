import { validateConfig } from './config';
import { TelegramBotHandler } from './bot';

async function main() {
  try {
    // Validate environment variables
    validateConfig();

    // Initialize and start the bot
    const botHandler = new TelegramBotHandler();
    botHandler.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔄 Received SIGINT, shutting down gracefully...');
      botHandler.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
      botHandler.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});