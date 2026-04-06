import { ArrowRight, FlaskConical, Gauge, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { loadLatestResults } from '@/lib/results';

type Row = Record<string, string | number | boolean | null>;

function SummaryTable({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No summary rows yet.</p>;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  return (
    <div className="overflow-hidden rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-muted/30 hover:bg-muted/40">
            {columns.map((column) => (
              <TableHead key={column} className="font-semibold text-foreground">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} className="transition-colors hover:bg-muted/20">
              {columns.map((column) => (
                <TableCell key={column} className="font-medium">
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

function DetailTable({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No detailed rows yet.</p>;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).filter((key) => key !== 'raw');
  const previewRows = rows.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-muted/30 hover:bg-muted/40">
            {columns.map((column) => (
              <TableHead key={column} className="font-semibold text-foreground">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewRows.map((row, index) => (
            <TableRow key={index} className="transition-colors hover:bg-muted/20">
              {columns.map((column) => (
                <TableCell key={column} className="max-w-[220px] truncate font-medium">
                  {String(row[column] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length > 8 && (
        <div className="border-t bg-muted/20 px-4 py-3 text-center text-xs text-muted-foreground">
          Showing 8 of {rows.length} rows
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="group border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:border-border hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight">{value}</CardTitle>
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/15 group-hover:ring-primary/30">
            <Icon className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const { phase2, phase3 } = await loadLatestResults();
  const phase2Rows = phase2?.rows ?? [];
  const phase3Rows = phase3?.rows ?? [];

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12 md:px-10 md:py-16 lg:px-12 lg:py-20">
      <section className="space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm">
            Pydantic Agent Benchmark
          </Badge>
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs font-medium shadow-sm">
            Kimi 2.5 · shadcn/ui · Next.js
          </Badge>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <h1 className="max-w-4xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl md:leading-[1.1]">
              Measure structured-output agents like a system, not a vibe.
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Compare prompt-only JSON, schema-constrained output, and schema plus Pydantic validation across
              single-turn extraction and multi-step agent loops.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="shadow-md transition-shadow hover:shadow-lg">
                <a href="#results">
                  View benchmark results
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-sm">
                <a href="https://ui.shadcn.com/docs/installation/next" target="_blank" rel="noreferrer">
                  shadcn/ui docs
                </a>
              </Button>
            </div>
          </div>

          <Card className="border-border/60 bg-card/80 shadow-md backdrop-blur-sm transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Current build status</CardTitle>
              <CardDescription className="leading-relaxed">Frontend is on shadcn/ui. Benchmark runner is live. Phase 3 is being tightened for stability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="font-medium">Phase 2</span>
                <Badge className="shadow-sm">Ready</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="font-medium">Phase 3 runner</span>
                <Badge variant="secondary" className="shadow-sm">Improving</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="font-medium">Vercel-ready UI</span>
                <Badge variant="outline" className="shadow-sm">In progress</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <StatCard
          title="Speed"
          value={phase2 ? `${phase2.summary.length} modes` : '—'}
          description="Track latency per output-control mode with the same temperature and case set."
          icon={Gauge}
        />
        <StatCard
          title="Success rate"
          value={phase2 ? `${Math.round(((Number(phase2.summary[0]?.json_success_rate ?? 0)) || 0) * 100)}%+` : '—'}
          description="Measure JSON parse success, schema validation, task completion, and retry pressure."
          icon={ShieldCheck}
        />
        <StatCard
          title="Determinism"
          value="Mock tools"
          description="Weather, calendar, and docs are mocked so loop differences are easier to explain."
          icon={FlaskConical}
        />
      </section>

      <section id="results" className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Benchmark results</h2>
          <p className="text-sm text-muted-foreground">Summary first, then a preview of raw benchmark rows for each phase.</p>
        </div>

        <Tabs defaultValue="phase2" className="w-full">
          <TabsList>
            <TabsTrigger value="phase2">Phase 2</TabsTrigger>
            <TabsTrigger value="phase3">Phase 3</TabsTrigger>
          </TabsList>

          <TabsContent value="phase2">
            <Card className="border-border/60 bg-card/85 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Single-turn structured output</CardTitle>
                <CardDescription>
                  Extraction and planning tasks measured for latency, JSON success, and schema pass rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {phase2 ? (
                  <>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Generated {phase2.generated_at}</p>
                    <SummaryTable rows={phase2.summary} />
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Detailed row preview</h3>
                      <DetailTable rows={phase2Rows} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No Phase 2 results found yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phase3">
            <Card className="border-border/60 bg-card/85 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Agent loop benchmark</CardTitle>
                <CardDescription>
                  Multi-step loop with mocked tools for weather, calendar, retrieval, and final answers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {phase3 ? (
                  <>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Generated {phase3.generated_at}</p>
                    <SummaryTable rows={phase3.summary} />
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Detailed row preview</h3>
                      <DetailTable rows={phase3Rows} />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>No Phase 3 results found yet.</p>
                    <p>The runner is in place; current work is improving timeout tolerance and loop stability.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
