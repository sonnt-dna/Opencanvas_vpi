// pages/api/file_ids.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllFileIds } from './databaseUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fileIds = await getAllFileIds();
    res.status(200).json(fileIds);
  } catch (error) {
    console.error('Error fetching file IDs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
