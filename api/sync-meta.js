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

export default async function handler(req, res) {
  try {
    const secret = req.query.secret;

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        ok: false,
        error: "Unauthorized",
      });
    }

    const PAGE_ID = process.env.META_PAGE_ID;
    const TOKEN = process.env.META_ACCESS_TOKEN;

    if (!PAGE_ID || !TOKEN) {
      return res.status(400).json({
        ok: false,
        error: "Missing META_PAGE_ID or META_ACCESS_TOKEN",
      });
    }

    const url = `https://graph.facebook.com/v25.0/${PAGE_ID}?fields=name,fan_count,followers_count&access_token=${TOKEN}`;

    const response = await fetch(url);
    const meta = await response.json();

    if (meta.error) {
      return res.status(500).json({
        ok: false,
        error: meta.error,
      });
    }

    const payload = {
      date: todaySonora(),
      platform: "facebook",
      followers_count: meta.followers_count ?? 0,
      reach: 0,
      views: 0,
      profile_views: 0,
      clicks: 0,
      interactions: 0,
      raw: meta,
    };

    const { data, error } = await supabase
      .from("meta_daily_metrics")
      .upsert(payload, { onConflict: "date,platform" })
      .select();

    if (error) {
      return res.status(500).json({
        ok: false,
        error,
      });
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
