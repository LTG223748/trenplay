import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_QUESTIONS_PER_MONTH = 25;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      console.error("❌ Missing fields in TrenBot request:", { userId, message });
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY is missing from .env.local");
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing from .env.local");
      return res.status(500).json({ error: "Missing Firebase Admin key" });
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const usageRef = db.collection("trenbotUsage").doc(userId);
    const snap = await usageRef.get();

    let count = 0;
    if (snap.exists) {
      const data = snap.data()!;
      if (data.month === monthKey) {
        count = data.count || 0;
      }
    }

    if (count >= MAX_QUESTIONS_PER_MONTH) {
      console.log(`⚠️ User ${userId} hit monthly cap`);
      return res.status(200).json({
        reply: "🤖 You've reached the monthly TrenBot limit. Email us at support@trenplay.com for more help.",
      });
    }

    if (snap.exists && snap.data()!.month === monthKey) {
      await usageRef.update({
        count: count + 1,
        updatedAt: new Date(),
      });
    } else {
      await usageRef.set({
        userId,
        month: monthKey,
        count: 1,
        updatedAt: new Date(),
      });
    }

    // 🧠 Call OpenAI
    console.log("➡️ Sending prompt to OpenAI:", message);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are TrenBot, a helpful assistant for TrenPlay. Answer only about TrenPlay, matches, and TrenCoin. If unsure, tell the user to email support@trenplay.com.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 200,
    });

    const reply = completion.choices[0].message?.content ?? "Something went wrong.";
    console.log("🤖 TrenBot reply:", reply);

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("❌ TrenBot API error:", err.message || err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


