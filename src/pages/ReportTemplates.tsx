import { useEffect, useState } from "react";

type TemplateFile = {
  id: string;
  name: string;
  size?: number;
  lastModified?: string;
  downloadUrl?: string;
};

const API_URL = import.meta.env.VITE_API_URL;

function humanSize(bytes?: number) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ReportTemplates() {
  const [files, setFiles] = useState<TemplateFile[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadTemplates() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const json = await res.json();
      // accept either array or { files: [...] }
      if (Array.isArray(json)) setFiles(json);
      else if (json && Array.isArray(json.files)) setFiles(json.files);
      else setFiles([]);
    } catch (err) {
      console.error("Load templates error:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  return (

      <div className="p-6 bg-white rounded-xl shadow-lg max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
         <h2 className="text-xl font-semibold mb-4">📄 Тайлан файлууд</h2>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Ачааллаж байна…</div>
        ) : files.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Файл олдсонгүй.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-gray-800">{f.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {humanSize(f.size)}{f.lastModified ? ` · ${new Date(f.lastModified).toLocaleDateString()}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {f.downloadUrl ? (
                    <a
                      href={f.downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      Татах
                    </a>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      Татах
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

  );
}
