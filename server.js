import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// UTILIDAD PARA LOGS MÁS LIMPIOS
function logEvent(type, issueKey, user) {
  console.log(`📌 ${type} | Issue: ${issueKey} | Usuario: ${user}`);
}

// URL BASE DE JIRA PARA LOS LINKS
const JIRA_BASE_URL = "https://tu-organizacion.atlassian.net/browse/"; 
// ⚠️ Cambia esto por tu dominio Jira

// MAIN WEBHOOK
app.post("/jira", async (req, res) => {
  try {
    const body = req.body;

    if (!body || !body.issue) {
      console.log("❗ Webhook inválido recibido");
      return res.status(400).send("Invalid webhook");
    }

    const issue = body.issue;
    const user = body.user?.displayName || "Usuario desconocido";
    const issueKey = issue.key;
    const issueSummary = issue.fields?.summary || "Sin título";
    const issueDesc = issue.fields?.description || "Sin descripción";
    const issueUrl = `${JIRA_BASE_URL}${issueKey}`;

    // Detectar tipo de evento
    let eventType = "Actualización";
    if (body.webhookEvent === "jira:issue_created") eventType = "Creación";
    else if (body.webhookEvent === "jira:issue_updated") {
      if (body.changelog?.items?.some(i => i.field === "status"))
        eventType = "Transición de estado";
      else if (body.comment) eventType = "Nuevo comentario";
      else eventType = "Actualización";
    }

    // LOG LIMPIO
    logEvent(eventType, issueKey, user);

    // EMBED BONITO PARA DISCORD
    const embed = {
      title: `${eventType}: ${issueKey}`,
      description: issueSummary,
      url: issueUrl,
      color: 0x00aaff,
      fields: [
        {
          name: "Descripción",
          value: issueDesc.length > 200 ? issueDesc.slice(0, 200) + "..." : issueDesc,
        },
        {
          name: "Modificado por",
          value: user,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };

    // MENSAJE PARA DISCORD
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `🔔 **Nuevo evento en Jira • ${eventType}**`,
        embeds: [embed]
      })
    });

    res.status(200).send("OK");

  } catch (err) {
    console.error("🔥 ERROR EN WEBHOOK:", err);
    res.status(500).send("Error");
  }
});

// PORT LISTENER
app.listen(process.env.PORT || 3000, () =>
  console.log(`Servidor listo en puerto ${process.env.PORT || 3000}`)
);
