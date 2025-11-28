import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Tu endpoint para recibir los webhooks de Jira
app.post("/jira", async (req, res) => {
  try {
    const body = req.body;

    const issueKey = body.issue.key;
    const summary = body.issue.fields.summary;
    const url = body.issue.self.replace("/rest/api/2/issue/", "/browse/");

    // Webhook de Discord desde variable de entorno
    const discordWebhook = process.env.DISCORD_WEBHOOK;

    const message = {
      content: `🆕 **Nueva tarea en Jira**\n🔑 *${issueKey}* - ${summary}\n🔗 ${url}`
    };

    await fetch(discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// Puerto para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor listo en puerto " + PORT));
