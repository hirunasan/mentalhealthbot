"use client"

import { useEffect, useState } from "react"
import Head from "next/head"

export default function Home() {
  const [status, setStatus] = useState("Checking bot status...")
  const [webhookUrl, setWebhookUrl] = useState("")

  useEffect(() => {
    // Check if the bot is properly set up
    async function checkBotStatus() {
      try {
        const response = await fetch("/api/setWebhook")
        const data = await response.json()

        if (data.success) {
          setStatus("Bot is active and webhook is set up!")
          setWebhookUrl(data.message.split("Webhook set to ")[1])
        } else {
          setStatus("Error setting up webhook. Check server logs.")
        }
      } catch (error) {
        setStatus("Error checking bot status.")
        console.error(error)
      }
    }

    checkBotStatus()
  }, [])

  return (
    <div className="container">
      <Head>
        <title>Mental Health Support Bot</title>
        <meta name="description" content="A Telegram bot for mental health support" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Mental Health Support Bot</h1>
        <p className="description">A Telegram bot designed to provide mental health support</p>

        <div className="status">
          <h2>Bot Status</h2>
          <p>{status}</p>
          {webhookUrl && (
            <p>
              Webhook URL: <code>{webhookUrl}</code>
            </p>
          )}
        </div>

        <div className="card">
          <h2>How to Use</h2>
          <ol>
            <li>Find your bot on Telegram (using the username you set with BotFather)</li>
            <li>
              Start a conversation with <code>/start</code>
            </li>
            <li>Chat with the bot about how you're feeling</li>
          </ol>
        </div>

        <div className="card">
          <h2>Available Commands</h2>
          <ul>
            <li>
              <strong>/start</strong> - Start or restart the bot
            </li>
            <li>
              <strong>/help</strong> - Show help information
            </li>
            <li>
              <strong>/reset</strong> - Reset your conversation history
            </li>
            <li>
              <strong>/resources</strong> - Get mental health resources
            </li>
            <li>
              <strong>/tip</strong> - Get a mental health tip
            </li>
          </ul>
        </div>
      </main>

      <footer>
        <p>Mental Health Support Bot - Powered by AI</p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        h1 {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 1rem 0;
        }

        .card {
          margin: 1rem 0;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          width: 100%;
        }

        .status {
          margin: 1rem 0;
          padding: 1.5rem;
          text-align: center;
          color: inherit;
          background-color: #f0f0f0;
          border-radius: 10px;
          width: 100%;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        ul, ol {
          padding-left: 1.5rem;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
