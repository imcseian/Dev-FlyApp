"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, File as FileIcon, Loader2, X, CheckCircle2 } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

/**
 * Playground module: File upload.
 *
 * Exercises `<input type="file">` + FormData upload to /api/upload.
 * playwright tests can use `setInputFiles()`, `page.setInputFiles()`, and
 * test the success/error/loading states.
 */
export function FileUploadDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setUploaded(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setUploaded({
        name: data.file.name,
        size: data.file.size,
        type: data.file.type,
        url: data.url,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Card data-testid="file-upload-demo">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload any file under 5MB. playwright can target{" "}
          <code className="px-1 py-0.5 bg-muted rounded">
            input[type=file]
          </code>{" "}
          via <code className="px-1 py-0.5 bg-muted rounded">setInputFiles()</code>.
        </p>

        {/* Drop zone — visually indicates drag state. Click to open picker. */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          data-testid="file-drop-zone"
          aria-label="Click to select a file or drag and drop"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium">
            {dragOver ? "Drop to upload" : "Click to select or drag a file"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Any file type, max 5MB
          </p>
        </button>

        <input
          ref={inputRef}
          id="file-upload-input"
          type="file"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
          data-testid="file-upload-input"
        />

        {/* Hidden label for screen-reader accessibility */}
        <Label htmlFor="file-upload-input" className="sr-only">
          File input
        </Label>

        {/* Loading */}
        {uploading && (
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            data-testid="file-upload-loading"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"
            data-testid="file-upload-error"
            role="alert"
          >
            <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {uploaded && (
          <div
            className="flex items-start gap-3 p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 text-sm"
            data-testid="file-upload-success"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-medium flex items-center gap-2">
                <FileIcon className="h-3 w-3" />
                <span className="truncate">{uploaded.name}</span>
              </div>
              <div className="text-xs mt-1 opacity-80">
                {(uploaded.size / 1024).toFixed(1)} KB · {uploaded.type || "unknown type"}
              </div>
              <div className="text-xs mt-1 opacity-60 font-mono truncate">
                {uploaded.url}
              </div>
              <Badge variant="outline" className="mt-2 text-xs">
                Uploaded successfully
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
