// api/dashboard/health.js
import { getCollection } from '../../src/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const collection = await getCollection();

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const todayVideos = await collection.countDocuments({
      _id: { $gte: startOfDay.getTime() ? undefined : undefined }, // si usas otro campo, cámbialo
    });

    const data = {
      lastCheckAt: now.toISOString(),
      lastError: null,           // si tienes logs, aquí puedes poner el último
      services: {
        youtube: 'ok',
        mongodb: 'ok',
        telegram: 'ok',
      },
      todayVideos,
    };

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('Error in dashboard/health handler:', err);
    return res.status(500).json({ ok: false, error: 'Internal Server Error' });
  }
}
