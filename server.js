import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 💬 URL del webhook de Discord
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

// ✨ Limpieza de logs
function log(...args) {
  console.log("[JIRA ➜ DISCORD]", ...args);
}

// 🧠 Función para enviar embed a Discord
async function sendDiscordEmbed({ title, description, user, issueUrl, status }) {
  const embed = {
    title: title || "Actualización en Jira",
    description: description || "Sin descripción",
    color: 3447003,
    fields: [
      { name: "👤 Usuario", value: user || "Desconocido", inline: true },
      { name: "📌 Estado", value: status || "N/A", inline: true },
      { name: "🔗 Enlace", value: `[Abrir Issue](${issueUrl})`, inline: false }
    ],
    timestamp: new Date().toISOString()
  };

  await fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] })
  });
}

// 🔥 WEBHOOK — donde Jira envía la información
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // --- EXTRAER DATOS IMPORTANTES ---
    const issue = body.issue;
    const user = body.user?.displayName;
    const changelog = body.changelog;
    const event = body.webhookEvent;

    const issueKey = issue?.key;
    const summary = issue?.fields?.summary;
    const description = issue?.fields?.description || "Sin descripción";
    const status = issue?.fields?.status?.name;

    const issueUrl = `https://josealejandroosorioramirez.atlassian.net/browse/${issueKey}`;

    log(`Evento recibido: ${event}`);
    log(`Issue: ${issueKey}`);

    await sendDiscordEmbed({
      title: `🔔 ${issueKey} — ${summary}`,
      description,
      user,
      issueUrl,
      status
    });

    return res.status(200).send("OK");
  } catch (e) {
    console.error("ERROR procesando webhook", e);
    return res.status(500).send("ERROR");
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log(`Servidor iniciado en puerto ${PORT}`));
