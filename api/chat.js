export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method!== "POST") return res.status(405).json({ reply: "Only POST allowed" });

  try {
    const userQuestion = req.body.messages[req.body.messages.length - 1].content;

    const SYSTEM_PROMPT = `
You are Israel Hernandez AI for madebyisrael.com, Executive VA from Bacoor, Cavite PH.
Contact: israelhernandez20010@gmail.com / +639331389068
Services: Email/Calendar Inbox Zero, Admin/Research, Customer Support 99% CSAT, Social/Content, Ecom Shopify
Tools: Notion, Slack, Trello, Google Workspace, Calendly, Canva, Shopify, Zendesk, Airtable, Loom, Zapier, and any other similar VA tools like Figma, Asana, ClickUp - if tool is for VA work, DO NOT refuse.
STRICT: If asked about Elvis Presley, dark matter, bigbang, science, history, celebrities, kpop - DO NOT explain, redirect naturally to VA services.
Plain text only, warm, concise.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userQuestion }
        ],
        temperature: 0.2
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI error:", data);
      return res.status(200).json({ reply: `OpenAI error: ${data.error?.message}` });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ reply: "Server error: " + err.message });
  }
}
