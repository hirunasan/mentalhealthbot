import bot from "./webhook"

export default async function handler(req, res) {
  try {
    // Get the Vercel deployment URL
    const host = req.headers.host || process.env.VERCEL_URL
    if (!host) {
      return res.status(400).json({ error: "Could not determine host" })
    }

    const webhookUrl = `https://${host}/api/telegram`

    // Set the webhook
    await bot.telegram.setWebhook(webhookUrl)

    res.status(200).json({
      success: true,
      message: `Webhook set to ${webhookUrl}`,
    })
  } catch (error) {
    console.error("Error setting webhook:", error)
    res.status(500).json({ error: "Failed to set webhook" })
  }
}
