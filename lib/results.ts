import { promises as fs } from 'fs';
import path from 'path';

export type SummaryRow = Record<string, string | number | boolean | null>;

export interface BenchmarkResultFile {
  generated_at: string;
  phase: string;
  summary: SummaryRow[];
  rows: SummaryRow[];
}

async function readJsonIfExists(filePath: string): Promise<BenchmarkResultFile | null> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as BenchmarkResultFile;
  } catch {
    return null;
  }
}

export async function loadLatestResults() {
  const root = process.cwd();
  const phase2 = await readJsonIfExists(path.join(root, 'results', 'phase2.latest.json'));
  const phase3 = await readJsonIfExists(path.join(root, 'results', 'phase3.latest.json'));
  return { phase2, phase3 };
}
