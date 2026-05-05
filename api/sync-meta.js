export default async function handler(req, res) {
  try {
    // 🔐 Validar secret (seguridad básica)
    const secret = req.query.secret
    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized"
      })
    }

    const PAGE_ID = process.env.META_PAGE_ID
    const TOKEN = process.env.META_ACCESS_TOKEN

    if (!PAGE_ID || !TOKEN) {
      return res.status(400).json({
        ok: false,
        error: "Missing environment variables"
      })
    }

    // 📊 Métricas de Facebook
    const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/insights?metric=page_impressions,page_engaged_users&access_token=${TOKEN}`

    const response = await fetch(url)
    const data = await response.json()

    // 🚨 Si Meta responde error
    if (data.error) {
      return res.status(500).json({
        ok: false,
        error: data.error
      })
    }

    // ✅ Respuesta correcta
    return res.status(200).json({
      ok: true,
      metrics: data.data
    })

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    })
  }
}
