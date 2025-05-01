import { Telegraf } from "telegraf"
import { pipeline } from "@xenova/transformers"

// Initialize the bot with the token from environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN
if (!botToken) {
  console.error("Bot token is not defined in environment variables")
}

// Create a new bot instance
const bot = new Telegraf(botToken)

// Store for conversation history (in-memory - will reset on deployment)
const conversations = new Map()

// Initialize the model pipeline (lazy-loaded)
let modelPromise = null
function getModel() {
  if (!modelPromise) {
    console.log("Loading AI model...")
    modelPromise = pipeline("text-generation", "Xenova/distilgpt2")
  }
  return modelPromise
}

// Helper to manage conversation history
function getConversation(userId) {
  if (!conversations.has(userId)) {
    conversations.set(userId, [])
  }
  return conversations.get(userId)
}

// Mental health resources
const mentalHealthResources = `
Here are some mental health resources that might help:

- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 1-800-273-8255
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

Remember, it's okay to ask for help, and you're not alone.
`

// Mental health tips
const mentalHealthTips = [
  "Take a few deep breaths. Inhale for 4 counts, hold for 4, and exhale for 6.",
  "Try to name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
  "It's okay to take a break. Self-care isn't selfish.",
  "Small steps are still progress. Be proud of what you accomplish today, no matter how small.",
  "Your feelings are valid, even if you don't understand them right now.",
  "Drink some water and check if you've eaten recently. Basic needs affect our mental state.",
  "Try to limit social media if it's making you feel worse.",
  "Remember that this moment is temporary. Things can and will change.",
  "You don't have to face everything alone. Reaching out is a sign of strength.",
  "Be as kind to yourself as you would be to a good friend.",
]

// Bot commands
bot.start((ctx) => {
  const userId = ctx.from.id
  conversations.set(userId, []) // Reset conversation on start
  return ctx.reply(
    "👋 Hello! I'm here to support your mental health journey. You can talk to me about how you're feeling, and I'll do my best to help. Type /help to see what I can do.",
  )
})

bot.help((ctx) =>
  ctx.reply(`
I'm a mental health support bot. Here's how I can help:

/start - Start or restart our conversation
/help - Show this help message
/reset - Reset your conversation history
/resources - Get mental health resources
/tip - Get a mental health tip

You can also just chat with me about how you're feeling, and I'll listen and respond.
`),
)

bot.command("reset", (ctx) => {
  const userId = ctx.from.id
  conversations.set(userId, []) // Reset conversation
  return ctx.reply("🔄 Our conversation history has been reset. How are you feeling today?")
})

bot.command("resources", (ctx) => {
  return ctx.reply(mentalHealthResources)
})

bot.command("tip", (ctx) => {
  const randomTip = mentalHealthTips[Math.floor(Math.random() * mentalHealthTips.length)]
  return ctx.reply(`💡 ${randomTip}`)
})

// Message handler
bot.on("text", async (ctx) => {
  const userId = ctx.from.id
  const userMessage = ctx.message.text

  // Skip processing for commands
  if (userMessage.startsWith("/")) return

  console.log(`Received message from ${userId}: ${userMessage}`)

  try {
    // Let the user know we're processing
    const processingMessage = await ctx.reply("I'm thinking about how to respond...")

    // Get conversation history
    const conversation = getConversation(userId)

    // Add system instruction to guide the AI toward mental health support
    if (conversation.length === 0) {
      conversation.push(
        "System: You are a supportive and empathetic mental health companion. Your goal is to listen, validate feelings, and offer gentle support. Never give medical advice or diagnose. If someone seems in crisis, suggest professional help and resources. Be warm, kind, and focus on emotional support.",
      )
    }

    // Add user message to history
    conversation.push(`User: ${userMessage}`)

    // Create prompt with conversation history
    const recentConversation = conversation.slice(-10)
    const prompt = recentConversation.join("\n") + "\nAI:"

    // Get the model
    const pipe = await getModel()

    // Generate text based on conversation history
    const result = await pipe(prompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      top_p: 0.9,
    })

    let generatedText = result[0].generated_text

    // Extract only the new part (after the prompt)
    generatedText = generatedText.slice(prompt.length).trim()

    // Add AI response to history
    conversation.push(`AI: ${generatedText}`)

    // Delete "generating" message and send the response
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMessage.message_id)
    } catch (error) {
      console.log("Could not delete processing message:", error.message)
    }

    await ctx.reply(generatedText)

    console.log(`Sent response to ${userId}`)
  } catch (error) {
    console.error("Error generating response:", error)
    await ctx.reply("I'm having trouble processing right now. Could you try again in a moment?")
  }
})

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err)
  ctx.reply("I encountered an error. Please try again in a moment.")
})

// Export the bot instance for the webhook handler
export default bot
