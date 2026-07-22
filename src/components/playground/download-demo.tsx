"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileJson, FileSpreadsheet, FileCode } from "lucide-react";

/**
 * Playwright concept: File downloads.
 *
 * Triggers downloads via blob URLs. Playwright tests can assert on them:
 *
 *   const [download] = await Promise.all([
 *     page.waitForEvent('download'),
 *     page.getByTestId('download-csv').click(),
 *   ]);
 *   expect(download.suggestedFilename()).toBe('flywithram-bookings.csv');
 *   const content = await download.path();
 *   // or read the content
 *   const stream = await download.createReadStream();
 */
export function DownloadDemo() {
  const [lastDownload, setLastDownload] = useState<string | null>(null);

  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setLastDownload(filename);
  };

  const downloadCSV = () => {
    const csv = [
      "PNR,Flight,Origin,Destination,Passenger,Seat,Price,Status",
      "ABC123,FWR 101,JFK,LAX,Jane Tester,12A,$299,Confirmed",
      "DEF456,SKY 245,JFK,LAX,John Tester,14B,$249,Confirmed",
      "GHI789,CLD 88,JFK,LAX,Alice Tester,9C,$189,Pending",
    ].join("\n");
    triggerDownload("flywithram-bookings.csv", csv, "text/csv");
  };

  const downloadJSON = () => {
    const data = {
      pnr: "ABC123",
      flight: "FWR 101",
      route: { origin: "JFK", destination: "LAX" },
      passengers: [
        { name: "Jane Tester", seat: "12A", cabinClass: "economy" },
      ],
      total: 299,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    triggerDownload("flywithram-booking.json", JSON.stringify(data, null, 2), "application/json");
  };

  const downloadTXT = () => {
    const txt = `
Fly with Ram — Boarding Pass
============================

PNR:        ABC123
Flight:     FWR 101
From:       JFK (New York)
To:         LAX (Los Angeles)
Passenger:  Jane Tester
Seat:       12A
Cabin:      Economy
Departure:  2026-08-15 08:30 AM
Arrival:    2026-08-15 11:45 AM
Gate:       B22 (check airport screens)

Have a pleasant flight with Fly with Ram!
`;
    triggerDownload("flywithram-boarding-pass.txt", txt, "text/plain");
  };

  const downloadHTML = () => {
    const html = `<!doctype html>
<html>
<head>
  <title>Boarding Pass — ABC123</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    .pass { border: 2px solid #0ea5e9; border-radius: 12px; padding: 24px; }
    h1 { color: #0ea5e9; margin: 0 0 16px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
    .label { color: #71717a; }
    .value { font-weight: bold; }
  </style>
</head>
<body>
  <div class="pass">
    <h1>Boarding Pass</h1>
    <div class="row"><span class="label">PNR</span><span class="value">ABC123</span></div>
    <div class="row"><span class="label">Flight</span><span class="value">FWR 101</span></div>
    <div class="row"><span class="label">From</span><span class="value">JFK — New York</span></div>
    <div class="row"><span class="label">To</span><span class="value">LAX — Los Angeles</span></div>
    <div class="row"><span class="label">Passenger</span><span class="value">Jane Tester</span></div>
    <div class="row"><span class="label">Seat</span><span class="value">12A</span></div>
    <div class="row"><span class="label">Departure</span><span class="value">2026-08-15 08:30 AM</span></div>
  </div>
</body>
</html>`;
    triggerDownload("flywithram-boarding-pass.html", html, "text/html");
  };

  return (
    <Card data-testid="download-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          File download
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Each button triggers a file download via blob URL. Use{" "}
          <code className="px-1 py-0.5 bg-muted rounded">page.waitForEvent(&apos;download&apos;)</code>{" "}
          to capture the download and assert on its filename.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="download-snippet"
        >
{`// Capture the download event
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByTestId('download-csv').click(),
]);
expect(download.suggestedFilename()).toBe('flywithram-bookings.csv');
const path = await download.path(); // local file path`}
        </pre>

        <div className="grid grid-cols-2 gap-2" data-testid="download-actions">
          <Button onClick={downloadCSV} data-testid="download-csv" variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={downloadJSON} data-testid="download-json" variant="outline">
            <FileJson className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button onClick={downloadTXT} data-testid="download-txt" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            TXT
          </Button>
          <Button onClick={downloadHTML} data-testid="download-html" variant="outline">
            <FileCode className="h-4 w-4 mr-2" />
            HTML
          </Button>
        </div>

        {lastDownload && (
          <div
            className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
            data-testid="download-success"
          >
            <Download className="h-4 w-4" />
            Last downloaded: <Badge variant="outline">{lastDownload}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
