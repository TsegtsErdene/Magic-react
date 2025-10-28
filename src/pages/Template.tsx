import { useEffect, useState } from "react";

type TemplateFile = {
  id: string;
  name: string;
  size: number;
  lastModified: string;
  downloadUrl: string;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function TemplateDownloader() {
  const [files, setFiles] = useState<TemplateFile[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadTemplates() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setFiles(json);
    } catch (err) {
      console.error(err);
      alert("Файлуудыг татаж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">📄 Template файлууд</h2>

      {loading && <p>Ачааллаж байна...</p>}

      {!loading && files.length === 0 && <p>Файл олдсонгүй.</p>}

      <ul className="divide-y divide-gray-200">
        {files.map((f) => (
          <li key={f.id} className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-gray-800">{f.name}</div>
              <div className="text-xs text-gray-500">
                {(f.size / 1024).toFixed(1)} KB ·{" "}
                {new Date(f.lastModified).toLocaleDateString()}
              </div>
            </div>
            <a
              href={f.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Татах
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
