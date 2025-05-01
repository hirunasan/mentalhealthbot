import bot from "./webhook"

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body)
      res.status(200).end("OK")
    } else {
      // For GET requests, provide a simple status page
      res.status(200).json({ status: "Mental Health Bot Webhook is active" })
    }
  } catch (error) {
    console.error("Error in webhook handler:", error)
    res.status(500).json({ error: "Failed to process webhook" })
  }
}
