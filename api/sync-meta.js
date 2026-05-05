export default async function handler(req, res) {
  try {
    const secret = req.query.secret;

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized"
      });
    }

    const PAGE_ID = process.env.META_PAGE_ID;
    const TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PAGE_ID || !TOKEN) {
      return res.status(400).json({
        ok: false,
        error: "Missing environment variables"
      });
    }

    const url = `https://graph.facebook.com/v25.0/${PAGE_ID}/insights?metric=page_post_engagements,page_views_total&period=day&access_token=${TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(500).json({
        ok: false,
        error: data.error
      });
    }

    return res.status(200).json({
      ok: true,
      metrics: data.data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
