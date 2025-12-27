// api/dashboard/search.js
import { getCollection } from '../../src/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { q = '', field = 'all' } = req.query;
  if (!q.trim()) {
    return res.status(200).json({ ok: true, data: [] });
  }

  try {
    const collection = await getCollection();

    const regex = new RegExp(q.trim(), 'i');
    const or = [];

    if (field === 'title' || field === 'all') {
      or.push({ title: regex });
    }
    if (field === 'channel' || field === 'all') {
      or.push({ channelTitle: regex });
    }
    if (field === 'playlist' || field === 'all') {
      or.push({ playlistId: regex });
    }

    const docs = await collection
      .find(or.length ? { $or: or } : {})
      .sort({ publishedAt: -1 })
      .limit(20)
      .toArray();

    const data = docs.map((v) => ({
      title: v.title,
      channelTitle: v.channelTitle,
      playlistId: v.playlistId,
      playlistName: v.playlistName || null,
      publishedAt: v.publishedAt,
      url: v.url,
      thumbnailUrl: v.thumbnailUrl || null,
    }));

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('Error in dashboard/search handler:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
