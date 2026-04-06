import { FlaskConical, Gauge, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadLatestResults } from '@/lib/results';

function SummaryTable({ rows }: { rows: Record<string, string | number | boolean | null>[] }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No summary rows yet.</p>;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  return (
    <div className="rounded-xl border bg-black/10">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column} className="text-muted-foreground">
                  {String(row[column] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function HomePage() {
  const { phase2, phase3 } = await loadLatestResults();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-12 md:px-10 lg:px-12">
      <section className="space-y-5">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
          Pydantic Agent Benchmark
        </Badge>
        <div className="space-y-4">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Schema-constrained agents, measured instead of guessed.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            Benchmark Kimi 2.5 structured outputs across single-turn extraction and mocked agent loops,
            then visualize how schema constraints affect latency, retries, and success rates.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="border-white/10 bg-card/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/15 p-2 text-primary">
                <Gauge className="size-5" />
              </div>
              <CardTitle>Speed</CardTitle>
            </div>
            <CardDescription>Track latency by mode, per phase, with comparable temperature and cases.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-white/10 bg-card/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/15 p-2 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <CardTitle>Success rate</CardTitle>
            </div>
            <CardDescription>Measure JSON parse success, schema validation, task completion, and retries.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-white/10 bg-card/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/15 p-2 text-primary">
                <FlaskConical className="size-5" />
              </div>
              <CardTitle>Deterministic loop</CardTitle>
            </div>
            <CardDescription>Use mocked tools and fixed cases so differences are easier to explain.</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Phase 2 · Single-turn structured output</CardTitle>
            <CardDescription>
              Compare prompt-only JSON, schema-constrained output, and schema plus Pydantic validation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              <li>15 predefined extraction and planning cases</li>
              <li>Metrics: latency, JSON parse success, schema pass rate</li>
              <li>Current status: runnable and already producing result files</li>
            </ul>
            {phase2 ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Generated {phase2.generated_at}</p>
                <SummaryTable rows={phase2.summary} />
              </div>
            ) : (
              <p>No Phase 2 results found yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/85 backdrop-blur">
          <CardHeader>
            <CardTitle>Phase 3 · Agent loop benchmark</CardTitle>
            <CardDescription>
              Multi-step loop with mocked tools for weather, calendar, retrieval, and final answer actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              <li>10 deterministic tasks</li>
              <li>Metrics: task success, retries, rounds, total latency</li>
              <li>Runner now handles provider timeouts instead of crashing the whole batch</li>
            </ul>
            {phase3 ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Generated {phase3.generated_at}</p>
                <SummaryTable rows={phase3.summary} />
              </div>
            ) : (
              <p>No Phase 3 results found yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
