import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function todaySonora() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Hermosillo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getMetricValue(insights, metricName) {
  const metric = insights?.data?.find((m) => m.name === metricName);
  return metric?.values?.[0]?.value ?? 0;
}

export default async function handler(req, res) {
  try {
    const secret = req.query.secret;

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const PAGE_ID = process.env.META_PAGE_ID;
    const TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PAGE_ID || !TOKEN) {
      return res.status(400).json({
        ok: false,
        error: "Missing META_PAGE_ID or META_ACCESS_TOKEN",
      });
    }

    const pageUrl = `https://graph.facebook.com/v25.0/${PAGE_ID}?fields=name,fan_count,followers_count&access_token=${TOKEN}`;
    const pageResponse = await fetch(pageUrl);
    const pageInfo = await pageResponse.json();

    if (pageInfo.error) {
      return res.status(500).json({ ok: false, error: pageInfo.error });
    }

   const insightsUrl = `https://graph.facebook.com/v25.0/${PAGE_ID}/insights?metric=page_impressions,page_engaged_users&period=day&access_token=${TOKEN}`;
    const insights = await insightsResponse.json();

    let impressions = 0;
    let engagement = 0;

    if (!insights.error) {
      impressions = getMetricValue(insights, "page_impressions");
      engagement = getMetricValue(insights, "page_post_engagements");
    }

    const payload = {
      date: todaySonora(),
      platform: "facebook",
      followers_count: pageInfo.followers_count ?? pageInfo.fan_count ?? 0,
      reach: 0,
      views: impressions,
      profile_views: 0,
      clicks: 0,
      interactions: engagement,
      raw: {
        page: pageInfo,
        insights,
      },
    };

    const { data, error } = await supabase
      .from("meta_daily_metrics")
      .upsert(payload, { onConflict: "date,platform" })
      .select();

    if (error) {
      return res.status(500).json({ ok: false, error });
    }

    return res.status(200).json({
      ok: true,
      saved: data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
