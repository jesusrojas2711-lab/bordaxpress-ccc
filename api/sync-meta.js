import { createClient } from "@supabase/supabase-js";

const META_VERSION = "v25.0";

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

async function metaGet(path) {
  const url = new URL(`https://graph.facebook.com/${META_VERSION}${path}`);
  url.searchParams.set("access_token", process.env.META_ACCESS_TOKEN);

  const res = await fetch(url.toString());
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(JSON.stringify(json.error || json));
  }

  return json;
}

function getInsightValue(data, metricName) {
  const item = data?.data?.find((m) => m.name === metricName);
  const value = item?.values?.[0]?.value;

  if (typeof value === "number") return value;
  if (typeof value === "object" && value?.value != null) return value.value;

  return 0;
}

export default async function handler(req, res) {
  try {
    const secret = req.query.secret || req.headers["x-cron-secret"];

    if (secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const date = todaySonora();
    const igId = process.env.META_IG_ID;

    const profile = await metaGet(`/${igId}?fields=followers_count,username,name`);

    const reachData = await metaGet(
      `/${igId}/insights?metric=reach&period=day`
    );

    const profileViewsData = await metaGet(
      `/${igId}/insights?metric=profile_views&period=day&metric_type=total_value`
    );

    const viewsData = await metaGet(
      `/${igId}/insights?metric=views&period=day&metric_type=total_value`
    );

    const payload = {
      date,
      platform: "instagram",
      followers_count: profile.followers_count ?? 0,
      reach: getInsightValue(reachData, "reach"),
      views: getInsightValue(viewsData, "views"),
      profile_views: getInsightValue(profileViewsData, "profile_views"),
      raw: {
        profile,
        reachData,
        profileViewsData,
        viewsData,
      },
    };

    const { data, error } = await supabase
      .from("meta_daily_metrics")
      .upsert(payload, { onConflict: "date,platform" })
      .select();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      saved: data,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
