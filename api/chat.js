async function getKnowledgeBase() {
  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1rj-WOUWbw-x_MCAfQcm1MAXlbWasKLVPRcmXzxFQQlQ/export?format=csv";

  const response = await fetch(SHEET_URL);
  return await response.text();
}

export default async function handler(req, res) {
  // ✅ CORS HEADERS (CRITICAL)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ PRE-FLIGHT SUPPORT
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { messages } = req.body;

const knowledgeBase = await getKnowledgeBase();
    // Get latest user message
const userMessage = messages[messages.length - 1].content.toLowerCase();

// Allowed topics
const allowedTopics = [
  "israel",
  "hernandez",
  "you",
  "your",
  "about",
  "profile",
  "schedule",
  "Address",
  "location",
  "home",
  "phone",
  "introduce",
  "introduction",
  "experience",
  "skill",
  "skills",
  "tool",
  "tools",
  "service",
  "services",
  "portfolio",
  "project",
  "projects",
  "contact",
  "email",
  "phone",
  "availability",
  "hire",
  "work",
  "driver",
  "video",
  "editing",
  "openai",
  "chatbot",
  "github",
  "vercel",
  "ai",
  "resume",
  "cv"
];

const isRelated = allowedTopics.some(keyword =>
  userMessage.includes(keyword)
);

if (!isRelated) {
  return res.status(200).json({
    reply:
      "Sorry, I can only answer questions about Israel Hernandez, including my profile, skills, experience, projects, services, and contact information."
  });
}

    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  model: "gpt-5.4-nano",
  messages: [
    {
      role: "system",
      content: `You are Israel Hernandez's AI assistant.

Use ONLY the following business knowledge base when answering.

${knowledgeBase}

If the answer is not found, politely say you don't have that information.`
    },
    ...messages
  ],
  temperature: 0.3
})
      }
    );

    const data = await openaiRes.json();

    return res.status(200).json({
  reply: knowledgeBase
});

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
