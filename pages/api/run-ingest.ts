import { NextApiRequest, NextApiResponse } from 'next';
import { run } from '@/scripts/ingest-url-params';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, namespace } = req.query;

  try {
    await run(url as string, namespace as string);
    res.status(200).json({ message: 'Ingestion complete' });
  } catch (error) {
    console.error('Error in ingestion', error);
    res.status(500).json({ message: 'Error in ingestion', error: (error as Error).message });
  }
}
