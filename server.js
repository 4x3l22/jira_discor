import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Endpoint para Jira
app.post("/jira", async (req, res) => {
  console.log("📥 Webhook recibido de Jira:");
  console.log(JSON.stringify(req.body, null, 2)); // IMPRIME TODO EL JSON

  try {
    const body = req.body;

    if (!body || !body.issue) {
      console.log("❗ ERROR: Jira no envió un issue válido.");
    } else {
      console.log("✔ Issue recibido:", body.issue.key);
    }

    // Enviar a Discord (solo para probar)
    await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Webhook recibido desde Jira ✔" })
    });

    console.log("📤 Enviado a Discord correctamente");
    res.status(200).send("OK");
  } catch (err) {
    console.error("🔥 Error:", err);
    res.status(500).send("Error");
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Servidor iniciado en puerto 3000")
);
