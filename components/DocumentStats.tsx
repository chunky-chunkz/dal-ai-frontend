"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentKPIs {
  totalSearches: number;
  avgSearchLatency: number;
  latencyP50: number;
  latencyP95: number;
  avgResultsPerSearch: number;
  totalRetrievals: number;
  avgRelevanceScore: number;
  retrievalsBySource: {
    search: number;
    related: number;
    direct: number;
  };
  totalClicks: number;
  clickThroughRate: number;
  avgClickPosition: number;
  totalFeedback: number;
  helpfulRate: number;
  topQueries: { query: string; count: number; avgLatency: number }[];
  topDocuments: { docId: string; title: string; clicks: number; avgRelevance: number }[];
  totalDocuments: number;
  documentsIndexed: number;
  documentsUpdated: number;
  documentsDeleted: number;
  topCategories: { category: string; count: number }[];
  errors: number;
}

async function getDocumentStats(): Promise<DocumentKPIs> {
  const response = await fetch('http://localhost:8081/api/stats/documents');
  if (!response.ok) {
    throw new Error('Failed to fetch document statistics');
  }
  return response.json();
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DocumentStats() {
  const [data, setData] = useState<DocumentKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDocumentStats()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Lade Dokumenten-Statistiken…</div>
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
      <h2 className="text-2xl font-bold">Dokumenten-System Performance</h2>

      {/* Search Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📊 Such-Metriken</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard 
            title="Suchen Gesamt" 
            value={data.totalSearches}
            subtitle="Anzahl Suchanfragen"
          />
          <StatCard 
            title="Ø Latenz" 
            value={`${data.avgSearchLatency.toFixed(1)} ms`}
            subtitle="Durchschnittliche Suchzeit"
          />
          <StatCard 
            title="Latenz (P50/P95)" 
            value={`${data.latencyP50.toFixed(0)} / ${data.latencyP95.toFixed(0)} ms`}
            subtitle="Median / 95. Perzentil"
          />
          <StatCard 
            title="Ø Ergebnisse" 
            value={data.avgResultsPerSearch.toFixed(1)}
            subtitle="Pro Suche"
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">👆 Engagement-Metriken</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard 
            title="Dokument-Abrufe" 
            value={data.totalRetrievals}
            subtitle="Gesamt abgerufen"
          />
          <StatCard 
            title="Klicks" 
            value={data.totalClicks}
            subtitle={`${(data.clickThroughRate * 100).toFixed(1)}% Click-Through-Rate`}
          />
          <StatCard 
            title="Ø Klick-Position" 
            value={data.avgClickPosition.toFixed(1)}
            subtitle="Durchschnittliche Position"
          />
          <StatCard 
            title="Ø Relevanz" 
            value={data.avgRelevanceScore.toFixed(2)}
            subtitle="Relevanz-Score (0-1)"
          />
        </div>
      </div>

      {/* Feedback Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">⭐ Feedback & Qualität</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Feedback Erhalten" 
            value={data.totalFeedback}
            subtitle="Bewertungen"
          />
          <StatCard 
            title="Hilfreich-Rate" 
            value={`${(data.helpfulRate * 100).toFixed(0)}%`}
            subtitle="Positive Bewertungen"
          />
          <StatCard 
            title="Fehler" 
            value={data.errors}
            subtitle="Während Verarbeitung"
          />
        </div>
      </div>

      {/* Document Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📚 Dokumenten-Verwaltung</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard 
            title="Dokumente Aktiv" 
            value={data.totalDocuments}
            subtitle="Im Index"
          />
          <StatCard 
            title="Neu Indexiert" 
            value={data.documentsIndexed}
            subtitle="Hinzugefügt"
          />
          <StatCard 
            title="Aktualisiert" 
            value={data.documentsUpdated}
            subtitle="Geändert"
          />
          <StatCard 
            title="Gelöscht" 
            value={data.documentsDeleted}
            subtitle="Entfernt"
          />
        </div>
      </div>

      {/* Retrieval Sources */}
      <div>
        <h3 className="text-lg font-semibold mb-3">🔍 Abruf-Quellen</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Über Suche" 
            value={data.retrievalsBySource.search}
            subtitle="Direkte Suchergebnisse"
          />
          <StatCard 
            title="Verwandte Docs" 
            value={data.retrievalsBySource.related}
            subtitle="Ähnliche Dokumente"
          />
          <StatCard 
            title="Direkt" 
            value={data.retrievalsBySource.direct}
            subtitle="Direkt aufgerufen"
          />
        </div>
      </div>

      {/* Top Queries */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Top Suchanfragen</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topQueries.length === 0 ? (
            <div className="text-sm text-muted-foreground">Noch keine Daten verfügbar</div>
          ) : (
            <div className="space-y-2">
              {data.topQueries.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-8">#{idx + 1}</span>
                    <span className="font-medium">{item.query}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.count}× gesucht</span>
                    <span>Ø {item.avgLatency.toFixed(0)}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Documents */}
      <Card>
        <CardHeader>
          <CardTitle>📄 Beliebteste Dokumente</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topDocuments.length === 0 ? (
            <div className="text-sm text-muted-foreground">Noch keine Daten verfügbar</div>
          ) : (
            <div className="space-y-2">
              {data.topDocuments.map((item, idx) => (
                <div 
                  key={item.docId} 
                  className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-8">#{idx + 1}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.clicks} Klicks</span>
                    <span>Relevanz: {item.avgRelevance.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Categories */}
      {data.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📁 Top Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topCategories.map((item, idx) => (
                <div 
                  key={item.category} 
                  className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-8">#{idx + 1}</span>
                    <span className="font-medium capitalize">{item.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count} Dokumente</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
