export default async function handler(req, res) {
  try {
    // 🔐 Validar secret
    const secret = req.query.secret;

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized"
      });
    }

    // 📦 Variables
    const PAGE_ID = process.env.META_PAGE_ID;
    const TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PAGE_ID || !TOKEN) {
      return res.status(400).json({
        ok: false,
        error: "Missing environment variables"
      });
    }

    // 📊 Request a Meta (datos básicos que SIEMPRE funcionan)
    const url = `https://graph.facebook.com/v25.0/${PAGE_ID}?fields=name,fan_count,followers_count&access_token=${TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    // 🚨 Manejo de error de Meta
    if (data.error) {
      return res.status(500).json({
        ok: false,
        error: data.error
      });
    }

    // ✅ Respuesta exitosa
    return res.status(200).json({
      ok: true,
      metrics: data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
