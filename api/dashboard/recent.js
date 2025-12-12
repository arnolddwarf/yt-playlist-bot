// api/dashboard/recent.js
import { getCollection } from '../../src/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const collection = await getCollection();

    // últimos 10 vídeos insertados, da igual de qué playlist
    const docs = await collection
      .find({})
      .sort({ _id: -1 })
      .limit(10)
      .toArray();

    const data = docs.map((v) => ({
      title: v.title,
      channelTitle: v.channelTitle,
      playlistId: v.playlistId,
      playlistName: v.playlistName || null,
      publishedAt: v.publishedAt,
      notifiedAt: v.notifiedAt || v.insertedAt || null,
      url: v.url,
    }));

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('Error in dashboard/recent handler:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
