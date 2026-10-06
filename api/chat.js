export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method!== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { messages } = req.body;
    const userMessage = messages[messages.length - 1].content.toLowerCase();

    // MAS STRICT NA KEYWORDS - tanggalin yung "your, about, ai"
    const allowedTopics = [
      "israel", "hernandez", "madebyisrael",
      "va", "virtual assistant", "executive va",
      "email", "contact", "phone", "location", "bacoor", "cavite",
      "service", "services", "skill", "tools", "experience",
      "pricing", "rate", "hire", "availability", "portfolio"
    ];

    const isRelated = allowedTopics.some(k => userMessage.includes(k));

    if (!isRelated) {
      return res.status(200).json({
        reply: "Sorry, I can only answer about Israel Hernandez's Executive VA services — like email & calendar management, inbox zero, tools, process, rates, and contact info. If you want to hire, contact me at israelhernandez20010@gmail.com / +639331389068."
      });
    }

    // SERVER-SIDE SYSTEM PROMPT - hindi na galing sa frontend
    const SYSTEM_PROMPT = `
You are Israel Hernandez AI for madebyisrael.com.
You are an Executive Virtual Assistant based in Bacoor, Cavite, Philippines.
Tone: warm, polite, helpful, concise, plain text, no markdown.
ONLY answer about: profile, services, tools (【entity-Notion¦canonical_name=Notion】, Slack, Trello, 【entity-Google Workspace¦canonical_name=Google Workspace】, etc), process (48h onboarding), rates ($600/$1100), wins (37hrs saved, 3000->0 inbox, 99% CSAT), contact (israelhernandez20010@gmail.com, +639331389068).
If question is about 【entity-bigbang¦canonical_name=bigbang】, science, kpop, or anything unrelated, politely redirect to VA services.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // palitan mo gpt-5.4-nano wala pa yan, mag e-error
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: messages[messages.length - 1].content }
        ],
        temperature: 0.3
      })
    });

    const data = await openaiRes.json();
    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
