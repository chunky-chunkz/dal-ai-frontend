"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemoryStats } from "../src/api/client";

interface MemoryKPIs {
  totalSaved: number;
  autoSaveRate: number;
  askRate: number;
  rejectRate: number;
  avgScoreSaved: number;
  avgScoreRejected: number;
  retrievals: number;
  avgRelevantCount: number;
  latencyP50: number;
  latencyP95: number;
  topKeys: { key: string; count: number }[];
  errors: number;
  consolidations: number;
  summariesCreated: number;
  memoriesArchived: number;
}

export function MemoryStats() {
  const [data, setData] = useState<MemoryKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMemoryStats()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Lade Memory-Statistiken…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Fehler beim Laden: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Gespeichert" 
          value={data.totalSaved}
          subtitle={`${(data.autoSaveRate * 100).toFixed(0)}% Auto-Save`}
        />
        <StatCard 
          title="Vorgeschlagen" 
          value={(data.askRate * 100).toFixed(0) + "%"}
          subtitle="zur Benutzer-Bestätigung"
        />
        <StatCard 
          title="Abgelehnt" 
          value={(data.rejectRate * 100).toFixed(0) + "%"}
          subtitle="wegen Policy/Score"
        />
        <StatCard 
          title="Avg. Score (Saved)" 
          value={data.avgScoreSaved.toFixed(2)}
          subtitle="Confidence-Wert"
        />
        <StatCard 
          title="Retrievals" 
          value={data.retrievals}
          subtitle={`Ø ${data.avgRelevantCount.toFixed(1)} relevant`}
        />
        <StatCard 
          title="Latenz" 
          value={`${data.latencyP50 | 0} / ${data.latencyP95 | 0} ms`}
          subtitle="P50 / P95"
        />
        <StatCard 
          title="Konsolidierungen" 
          value={data.consolidations}
          subtitle="Merged/Updated"
        />
        <StatCard 
          title="Summaries" 
          value={data.summariesCreated}
          subtitle="Erstellt"
        />
        <StatCard 
          title="Archiviert" 
          value={data.memoriesArchived}
          subtitle="Memories zusammengefasst"
        />
      </div>

      {/* Top Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Memory Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topKeys.length === 0 ? (
            <div className="text-sm text-muted-foreground">Noch keine Daten verfügbar</div>
          ) : (
            <div className="space-y-2">
              {data.topKeys.map((item, idx) => (
                <div 
                  key={item.key} 
                  className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-mono">{item.key}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.count}×</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Errors */}
      {data.errors > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Fehler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {data.errors} Fehler während der Memory-Verarbeitung aufgetreten.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
