export default async function handler(req, res) {
  try {
    const PAGE_ID = process.env.META_PAGE_ID
    const TOKEN = process.env.META_ACCESS_TOKEN

    const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/insights?metric=page_impressions,page_engaged_users&page_token=${TOKEN}`

    const response = await fetch(url)
    const data = await response.json()

    res.status(200).json({
      ok: true,
      data
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    })
  }
}
