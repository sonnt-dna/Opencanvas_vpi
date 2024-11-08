import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const dbPath = 'ktem_app_data/user_data/sql.db';

interface FileIdRow {
  file_id: string;
}

export async function getAllFileIds(indices?: number[]): Promise<string[]> {
  const db = new sqlite3.Database(dbPath);
  const allAsync = promisify<string, FileIdRow[]>(db.all).bind(db);
  const closeAsync = promisify(db.close).bind(db);

  try {
    if (!indices) {
      const query = `
        SELECT DISTINCT s.file_id 
        FROM ktem__index i
        JOIN (
          ${Array.from({ length: 100 }, (_, i) => 
            `SELECT file_id FROM index__${i}__source`
          ).join(' UNION ALL ')}
        ) s`;
      
      const rows = await allAsync(query);
      return rows.map(row => row.file_id);
    } else {
      const query = `
        SELECT DISTINCT file_id 
        FROM (
          ${indices.map(i => 
            `SELECT file_id FROM index__${i}__source`
          ).join(' UNION ALL ')}
        )`;
      
      const rows = await allAsync(query);
      return rows.map(row => row.file_id);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Database error: ${error.message}`);
    }
    throw new Error('An unknown database error occurred');
  } finally {
    await closeAsync();
  }
}