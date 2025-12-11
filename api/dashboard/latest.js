// api/dashboard/latest.js
import { getCollection } from '../../src/db.js';
import { PLAYLISTS } from '../../src/config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const collection = await getCollection();

    // Para cada playlist buscamos el último video insertado
    const results = {};

    for (const [playlistId, topicId] of Object.entries(PLAYLISTS)) {
      const doc = await collection
        .find({ playlistId }) // luego añadiremos este campo al guardar
        .sort({ publishedAt: -1, _id: -1 })
        .limit(1)
        .toArray();

      if (doc[0]) {
        const v = doc[0];
        results[playlistId] = {
          title: v.title,
          channelTitle: v.channelTitle,
          publishedAt: v.publishedAt,
          url: v.url,
          thumbnailUrl: v.thumbnailUrl || null, 
          playlistId,
          reactions: v.reactions || { like: 0, love: 0, angry: 0 }
        };
      } else {
        results[playlistId] = null;
      }
    }

    return res.status(200).json({ ok: true, data: results });
  } catch (err) {
    console.error('Error in dashboard/latest handler:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
