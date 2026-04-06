import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { copy, type Locale } from '@/lib/copy';
import { loadLatestResults } from '@/lib/results';

type Row = Record<string, string | number | boolean | null>;

function SummaryTable({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No rows yet.</p>;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            {columns.map((column) => (
              <TableHead key={column} className="h-11 font-semibold text-foreground">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} className="hover:bg-muted/30">
              {columns.map((column) => (
                <TableCell key={column} className="font-medium text-foreground/85">
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

function DetailTable({ rows, locale }: { rows: Row[]; locale: Locale }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No rows yet.</p>;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).filter((key) => key !== 'raw');
  const previewRows = rows.slice(0, 8);
  const t = copy[locale];

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            {columns.map((column) => (
              <TableHead key={column} className="h-11 font-semibold text-foreground">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewRows.map((row, index) => (
            <TableRow key={index} className="hover:bg-muted/30">
              {columns.map((column) => (
                <TableCell key={column} className="max-w-[220px] truncate text-foreground/80">
                  {String(row[column] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length > 8 && (
        <div className="border-t bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground">
          {t.showing} {rows.length} {t.rows}
        </div>
      )}
    </div>
  );
}

function MetricStrip({ locale, phase2, phase3 }: { locale: Locale; phase2: any; phase3: any }) {
  const t = copy[locale];
  const items = [
    { label: t.stats.modes, value: phase2 ? String(phase2.summary.length) : '—' },
    { label: t.stats.success, value: phase3 ? `${Math.round(Number(phase3.summary?.[2]?.task_success_rate ?? 0) * 100)}%` : '—' },
    { label: t.stats.retries, value: phase3 ? String(phase3.summary?.[2]?.avg_retries ?? '—') : '—' },
    { label: t.stats.failure, value: t.stats.looping },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border bg-white px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ lang?: string }> }) {
  const params = (await searchParams) ?? {};
  const locale: Locale = params.lang === 'en' ? 'en' : 'zh';
  const t = copy[locale];
  const other = locale === 'zh' ? 'en' : 'zh';

  const { phase2, phase3 } = await loadLatestResults();
  const phase2Rows = phase2?.rows ?? [];
  const phase3Rows = phase3?.rows ?? [];
  const phase3FailureRows = (phase3 as { failure_summary?: Row[] } | null)?.failure_summary ?? [];

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10 md:px-10 lg:px-12 lg:py-14">
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]">
              {t.badge}
            </Badge>
            <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs">
              {t.stack}
            </Badge>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <a href={`/?lang=${other}`}>{other.toUpperCase()}</a>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <h1 className="max-w-5xl text-5xl font-semibold leading-[1.02] tracking-tight text-foreground md:text-7xl">
              {t.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{t.subtitle}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild size="lg" className="rounded-xl px-5 shadow-sm">
                <a href="#results">
                  {t.primaryCta}
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-5">
                <a href="https://ui.shadcn.com/docs/installation/next" target="_blank" rel="noreferrer">
                  {t.secondaryCta}
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border bg-white p-6">
            <div className="text-sm font-medium text-muted-foreground">{t.phase3FailureTitle}</div>
            <div className="text-2xl font-semibold tracking-tight">{phase3 ? `${Math.round(Number(phase3.summary?.[2]?.task_success_rate ?? 0) * 100)}%` : '—'}</div>
            <p className="text-sm leading-6 text-muted-foreground">{t.note}</p>
          </div>
        </div>
      </section>

      <MetricStrip locale={locale} phase2={phase2} phase3={phase3} />

      <section id="results" className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">{t.resultsTitle}</h2>
          <p className="text-base text-muted-foreground">{t.resultsSubtitle}</p>
        </div>

        <Tabs defaultValue="phase2" className="w-full">
          <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-2xl border bg-white p-1">
            <TabsTrigger value="phase2" className="rounded-xl">{t.phase2}</TabsTrigger>
            <TabsTrigger value="phase3" className="rounded-xl">{t.phase3}</TabsTrigger>
          </TabsList>

          <TabsContent value="phase2" className="mt-6 space-y-6">
            <section className="space-y-4 rounded-3xl border bg-white p-6">
              <div>
                <h3 className="text-2xl font-semibold">{t.phase2Title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.phase2Desc}</p>
              </div>
              {phase2 ? (
                <>
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {t.generated} {phase2.generated_at}
                  </div>
                  <SummaryTable rows={phase2.summary} />
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">{t.detail}</h4>
                    <DetailTable rows={phase2Rows} locale={locale} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noPhase2}</p>
              )}
            </section>
          </TabsContent>

          <TabsContent value="phase3" className="mt-6 space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 rounded-3xl border bg-white p-6">
                <div>
                  <h3 className="text-2xl font-semibold">{t.phase3Title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.phase3Desc}</p>
                </div>
                {phase3 ? (
                  <>
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.generated} {phase3.generated_at}
                    </div>
                    <SummaryTable rows={phase3.summary} />
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">{t.detail}</h4>
                      <DetailTable rows={phase3Rows} locale={locale} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t.noPhase3}</p>
                )}
              </div>

              <div className="space-y-4 rounded-3xl border bg-white p-6">
                <div>
                  <h3 className="text-xl font-semibold">{t.phase3FailureTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.phase3FailureDesc}</p>
                </div>
                {phase3FailureRows.length ? <SummaryTable rows={phase3FailureRows} /> : <p className="text-sm text-muted-foreground">No rows yet.</p>}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
