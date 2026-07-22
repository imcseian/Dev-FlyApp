"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Layers } from "lucide-react";

interface DraggableItem {
  id: string;
  label: string;
  color: string;
}

const INITIAL_ITEMS: DraggableItem[] = [
  { id: "1", label: "Boarding pass", color: "bg-sky-500" },
  { id: "2", label: "Passport", color: "bg-emerald-500" },
  { id: "3", label: "Visa", color: "bg-amber-500" },
  { id: "4", label: "Vaccination cert", color: "bg-rose-500" },
  { id: "5", label: "Travel insurance", color: "bg-violet-500" },
];

/**
 * Playwright concept: Drag and drop.
 *
 * Uses the HTML5 Drag and Drop API (no library). Playwright supports this via:
 *
 *   await page.getByTestId('drag-item-1').dragTo(
 *     page.getByTestId('drop-zone')
 *   );
 *
 *   // Manual drag for more control
 *   const item = page.getByTestId('drag-item-2');
 *   const target = page.getByTestId('drop-zone');
 *   await item.hover();
 *   await page.mouse.down();
 *   await target.hover();
 *   await page.mouse.up();
 */
export function DragDropDemo() {
  const [items, setItems] = useState<DraggableItem[]>(INITIAL_ITEMS);
  const [dropped, setDropped] = useState<DraggableItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: DraggableItem) => {
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(item.id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDropped((prev) => [...prev, item]);
  };

  const reset = () => {
    setItems(INITIAL_ITEMS);
    setDropped([]);
  };

  return (
    <Card data-testid="dragdrop-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Drag &amp; drop
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Uses the native HTML5 Drag and Drop API. Test with{" "}
          <code className="px-1 py-0.5 bg-muted rounded">locator.dragTo()</code>{" "}
          or manual <code className="px-1 py-0.5 bg-muted rounded">mouse.down/up</code>.
        </p>

        <pre
          className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono"
          data-testid="dragdrop-snippet"
        >
{`// Simple drag
await page.getByTestId('drag-item-1')
  .dragTo(page.getByTestId('drop-zone'));

// Manual drag (more control)
const item = page.getByTestId('drag-item-2');
const target = page.getByTestId('drop-zone');
await item.hover();
await page.mouse.down();
await target.hover();
await page.mouse.up();`}
        </pre>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Source list */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Travel documents (drag from here):
            </p>
            <ul
              className="space-y-2 min-h-[200px] p-3 border border-dashed border-border rounded-lg"
              data-testid="drag-source-list"
            >
              {items.length === 0 ? (
                <li className="text-sm text-muted-foreground text-center py-8">
                  All items dragged out
                </li>
              ) : (
                items.map((item) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    data-testid={`drag-item-${item.id}`}
                    className={`flex items-center gap-2 p-3 rounded-md bg-card border border-border cursor-move hover:border-sky-500 transition-colors ${
                      draggedId === item.id ? "opacity-50" : ""
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Drop zone */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Carry-on bag (drop here):
            </p>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-testid="drop-zone"
              className="space-y-2 min-h-[200px] p-3 border-2 border-dashed border-sky-500/40 rounded-lg bg-sky-500/5"
            >
              {dropped.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Drop items here
                </p>
              ) : (
                dropped.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`dropped-item-${item.id}`}
                    className="flex items-center gap-2 p-3 rounded-md bg-sky-500/10 border border-sky-500/30"
                  >
                    <GripVertical className="h-4 w-4 text-sky-600" />
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <Badge variant="outline" className="text-xs">
                      packed
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" data-testid="dragdrop-count">
            {dropped.length} / {INITIAL_ITEMS.length} packed
          </Badge>
          <button
            onClick={reset}
            data-testid="dragdrop-reset"
            className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
          >
            Reset
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
