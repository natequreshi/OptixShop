import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const IS_VERCEL = !!process.env.VERCEL;
const DB_PATH = IS_VERCEL
  ? '/tmp/optics.db'
  : path.join(__dirname, '..', '..', 'data', 'optics.db');

// Ensure data directory exists (not needed on Vercel)
if (!IS_VERCEL) {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Compatibility wrapper around sql.js to mimic better-sqlite3 API.
 * All existing code using db.prepare(sql).get(...), .all(...), .run(...)
 * will continue to work unchanged.
 */
class DatabaseWrapper {
  private _db!: SqlJsDatabase;
  private _ready: Promise<void>;
  private _dbPath: string;
  private _saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(dbPath: string) {
    this._dbPath = dbPath;
    this._ready = this._init();
  }

  private async _init() {
    const SQL = await initSqlJs();
    if (fs.existsSync(this._dbPath)) {
      const buffer = fs.readFileSync(this._dbPath);
      this._db = new SQL.Database(buffer);
    } else {
      this._db = new SQL.Database();
    }
    // Enable foreign keys
    this._db.run('PRAGMA foreign_keys = ON;');
  }

  /** Wait until the database is ready (call once at startup) */
  async waitReady(): Promise<void> {
    await this._ready;
  }

  /** Persist database to disk (debounced) */
  private _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._saveToDisk();
    }, 100);
  }

  private _saveToDisk() {
    try {
      const data = this._db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this._dbPath, buffer);
    } catch (e) {
      console.error('Failed to save database:', e);
    }
  }

  /** Save immediately (for shutdown) */
  saveSync() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    this._saveToDisk();
  }

  /** Execute raw SQL (for schema init, etc.) */
  exec(sql: string) {
    this._db.run(sql);
    this._scheduleSave();
  }

  /** PRAGMA helper */
  pragma(pragmaStr: string) {
    try {
      this._db.run(`PRAGMA ${pragmaStr};`);
    } catch (_) { /* ignore unsupported pragmas */ }
  }

  /** Prepare a statement — returns an object with get/all/run methods */
  prepare(sql: string) {
    const db = this._db;
    const wrapper = this;

    return {
      get(...params: any[]) {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          if (typeof params[0] === 'object' && !Array.isArray(params[0])) {
            stmt.bind(convertNamedParams(params[0]));
          } else {
            stmt.bind(params);
          }
        }
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          stmt.free();
          const row: any = {};
          cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
          return row;
        }
        stmt.free();
        return undefined;
      },

      all(...params: any[]) {
        const results: any[] = [];
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          if (typeof params[0] === 'object' && !Array.isArray(params[0])) {
            stmt.bind(convertNamedParams(params[0]));
          } else {
            stmt.bind(params);
          }
        }
        while (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          const row: any = {};
          cols.forEach((col: string, i: number) => { row[col] = vals[i]; });
          results.push(row);
        }
        stmt.free();
        return results;
      },

      run(...params: any[]) {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          if (typeof params[0] === 'object' && !Array.isArray(params[0])) {
            stmt.bind(convertNamedParams(params[0]));
          } else {
            stmt.bind(params);
          }
        }
        stmt.step();
        stmt.free();
        wrapper._scheduleSave();
        return { changes: db.getRowsModified(), lastInsertRowid: 0 };
      },
    };
  }

  /** Transaction helper — mimics better-sqlite3's transaction() */
  transaction<T extends (...args: any[]) => any>(fn: T): T {
    const self = this;
    return ((...args: any[]) => {
      self._db.run('BEGIN TRANSACTION;');
      try {
        const result = fn(...args);
        self._db.run('COMMIT;');
        self._scheduleSave();
        return result;
      } catch (e) {
        self._db.run('ROLLBACK;');
        throw e;
      }
    }) as any as T;
  }
}

/** Convert { key: value } named params to sql.js format with all prefix variants */
function convertNamedParams(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // sql.js expects $key or :key or @key — register all three so it works
    // regardless of which prefix the SQL uses
    if (key.startsWith('$') || key.startsWith(':') || key.startsWith('@')) {
      result[key] = value;
    } else {
      result[`$${key}`] = value;
      result[`@${key}`] = value;
      result[`:${key}`] = value;
    }
  }
  return result;
}

const db = new DatabaseWrapper(DB_PATH);

// Initialize schema
export async function initializeDatabase(): Promise<void> {
  await db.waitReady();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  // sql.js can't run multiple statements with run(), split by semicolons
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      db.exec(stmt + ';');
    } catch (e: any) {
      // Ignore "table already exists" type errors for IF NOT EXISTS
      if (!e.message?.includes('already exists')) {
        console.warn('Schema warning:', e.message?.substring(0, 80));
      }
    }
  }
  db.saveSync();
  console.log('✅ Database schema initialized');
}

// Save on process exit
process.on('exit', () => db.saveSync());
process.on('SIGINT', () => { db.saveSync(); process.exit(0); });
process.on('SIGTERM', () => { db.saveSync(); process.exit(0); });

export default db;
