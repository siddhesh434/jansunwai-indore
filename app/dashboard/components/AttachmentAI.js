"use client";
import { useState } from "react";
import { FileText, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { clampWords } from "@/lib/ai/wordClamp";

export default function AttachmentAI({ onAnalyzed }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files) => {
    setSelectedFiles(files);
    if (!files || files.length === 0) {
      setAnalyses([]);
      onAnalyzed?.([]);
      return;
    }

    setLoading(true);
    try {
      const results = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/attachments/analyze", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json?.success) {
          results.push({
            file,
            filename: json.filename,
            analysis: {
              ...json.analysis,
              description: clampWords(json.analysis?.description || "", 50, 60),
              summary: clampWords(json.analysis?.summary || "", 50, 60),
            },
          });
        } else {
          results.push({ file, error: json?.error || "Failed to analyze" });
        }
      }
      setAnalyses(results);
      onAnalyzed?.(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
          Analyzing attachments...
        </div>
      )}

      {analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((item, idx) => {
            const isImage = (item.file?.type || "").startsWith("image/");
            const isVideo = (item.file?.type || "").startsWith("video/");
            return (
              <div key={idx} className="bg-white border border-purple-100 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {isImage ? (
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                  ) : isVideo ? (
                    <VideoIcon className="w-4 h-4 text-purple-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-purple-600" />
                  )}
                  <span className="text-sm font-medium text-purple-800 truncate">
                    {item.file?.name}
                  </span>
                </div>

                {item.error ? (
                  <p className="text-xs text-red-600">{item.error}</p>
                ) : (
                  <div className="space-y-2">
                    {item.analysis?.description && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Content Description</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                          {item.analysis.description}
                        </p>
                      </div>
                    )}
                    {item.analysis?.metadata && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600">Metadata</summary>
                        <pre className="bg-gray-50 rounded p-2 overflow-auto max-h-40 text-[11px] text-gray-700">{JSON.stringify(item.analysis.metadata, null, 2)}</pre>
                      </details>
                    )}
                    {item.analysis?.summary && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Municipal Summary</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                          {item.analysis.summary}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


