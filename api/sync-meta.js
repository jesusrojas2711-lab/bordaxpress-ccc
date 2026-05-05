export default async function handler(req, res) {
  try {
    const { secret } = req.query;

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

    // 1. Obtener página
    const pageRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${ACCESS_TOKEN}`
    );
    const pageData = await pageRes.json();

    const page = pageData.data[0];
    const PAGE_ID = page.id;

    // 2. Obtener seguidores
    const pageInfoRes = await fetch(
      `https://graph.facebook.com/v19.0/${PAGE_ID}?fields=name,fan_count,followers_count&access_token=${ACCESS_TOKEN}`
    );
    const pageInfo = await pageInfoRes.json();

    // 3. Obtener métricas (INSIGHTS)
    const insightsRes = await fetch(
      `https://graph.facebook.com/v19.0/${PAGE_ID}/insights?metric=page_impressions,page_reach,page_engaged_users&period=day&access_token=${ACCESS_TOKEN}`
    );
    const insights = await insightsRes.json();

    let impressions = 0;
    let reach = 0;
    let engagement = 0;

    insights.data.forEach((metric) => {
      const value = metric.values[0].value;

      if (metric.name === "page_impressions") impressions = value;
      if (metric.name === "page_reach") reach = value;
      if (metric.name === "page_engaged_users") engagement = value;
    });

    // clicks (no siempre viene, lo dejamos en 0)
    const clicks = 0;

    // 4. Guardar en Supabase
    const supabaseRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/meta_daily_metrics`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            date: new Date().toISOString().split("T")[0],
            platform: "facebook",
            followers_count: pageInfo.followers_count,
            reach,
            views: impressions,
            profile_views: 0,
            clicks,
            interactions: engagement,
            raw: {
              page: pageInfo,
              insights,
            },
          },
        ]),
      }
    );

    const saved = await supabaseRes.json();

    return res.status(200).json({
      ok: true,
      saved,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
