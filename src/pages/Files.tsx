import { useEffect, useMemo, useState } from "react";
import { Tab } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import PageMeta from "../components/common/PageMeta";

type FileRow = {
  id: number;
  // file.category талбар нь "A,B,C" гэх мэт олон утга байж болно
  category: string;
  filename: string;
  status: "Хүлээгдэж буй" | "Баталсан" | "Цуцалсан" | "Шаардлага хангаагүй" | "Хэрэггүй" | "Хэрэггүй" |string;
  blobPath: string;
  uploadedAt: string;
  comment?: string;
  username?: string;
};

type CategoryRow = {
  name: string;   // MaterialList.CategoryName
  status: string;
  comment?: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const viewLabels = [
  "Бүгд",
  "Илгээгээгүй",
  "Хүлээгдэж буй",
  "Баталсан",
  "Дутуу",
  "Шаардлага хангаагүй",
  "Хэрэггүй"
] as const;

const statusFilter = ["", "Илгээгээгүй","Хүлээгдэж буй", "Баталсан", "Дутуу", "Шаардлага хангаагүй", "Хэрэггүй"] as const;

function cx(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

// /api/categories → фронтын формат руу
function mapCategory(raw: any): CategoryRow {
  return {
    name: raw.CategoryName,   // ← өөр байвал энд тааруул
    status: raw.status ?? "",       // ← өөр байвал энд тааруул
    comment: raw.comment ?? "",     // ← өөр байвал энд тааруул
  };
}

// "A,B , C" → ["A","B","C"]
function splitCategories(cat: string): string[] {
  if (!cat) return [];
  return cat
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Files() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [tabIndex, setTabIndex] = useState(0);
  const [search] = useState("");
  const [selectedCategory] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const username = localStorage.getItem("username") ?? "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    

    async function run() {
      try {
        setLoading(true);
        const [catRes, fileRes] = await Promise.all([
          fetch(`${API_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/files?userId=${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const catJson = await catRes.json();
        const fileJson = await fileRes.json();
        console.log("dd",fileJson);

        setCategories(Array.isArray(catJson) ? catJson.map(mapCategory) : []);
        setFiles(Array.isArray(fileJson) ? fileJson : []);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  // Мастер категори нэрс
  const masterNames = useMemo(
    () => categories.map((c) => c.name),
    [categories]
  );

  // Файлуудаас гарч ирсэн бүх категори (олон категори тус бүрээр)
  const extraNamesFromFiles = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => splitCategories(f.category).forEach((c) => set.add(c)));
    return Array.from(set);
  }, [files]);

  // Мастер + файлуудаас гарсан бүх категори → final жагсаалт
  const allCategoryNames = useMemo(() => {
    const set = new Set<string>(masterNames);
    extraNamesFromFiles.forEach((n) => set.add(n));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [masterNames, extraNamesFromFiles]);

  // Категори metadata map (нэр → {status, comment})
  const categoryMeta = useMemo(() => {
    const map = new Map<string, CategoryRow>();
    categories.forEach((c) => map.set(c.name, c));
    return map;
  }, [categories]);

  // Категори → файлууд (нэг файл олон категори руу репликейт)
  const filesByCategory = useMemo(() => {
    const map = new Map<string, FileRow[]>();
    allCategoryNames.forEach((name) => map.set(name, []));
    files.forEach((f) => {
      const cats = splitCategories(f.category);
      if (cats.length === 0) {
        // категори байхгүй файлыг “(No Category)” гэх мэт рүү хийе гэвэл энд нэр өгч болно
        return;
      }
      cats.forEach((cName) => {
        if (!map.has(cName)) map.set(cName, []);
        map.get(cName)!.push(f);
      });
    });
    return map;
  }, [files, allCategoryNames]);

  // Табын шүүлтүүр
  const currentStatus = statusFilter[tabIndex];

  // Таб бүрийн тооны тооцоо (мастер жагсаалтын статусыг ашиглана)
  const tabCounts = useMemo(() => {
    const counters: Record<(typeof viewLabels)[number], number> = {
      "Бүгд": 0,
      "Илгээгээгүй": 0,
      "Хүлээгдэж буй": 0,
      "Баталсан": 0,
      "Шаардлага хангаагүй": 0,
      "Дутуу": 0,
      "Хэрэггүй":0,
    };
    allCategoryNames.forEach((name) => {
      const meta = categoryMeta.get(name);
      const status = meta?.status;
      counters["Бүгд"] += 1;
      if (status && status in counters) {
        counters[status as keyof typeof counters] += 1;
      }
    });
    return counters;
  }, [allCategoryNames, categoryMeta]);

  // Хайлт/сонгосон категор/табын статусаар харагдах блок
  const visibleCategoryBlocks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allCategoryNames
      .filter((name) => (selectedCategory ? name === selectedCategory : true))
      .filter((name) => {
        // табын статус
        const meta = categoryMeta.get(name);
        const passByTab = currentStatus ? meta?.status === currentStatus : true;
        if (!passByTab) return false;

        // хайлт — категорийн нэр эсвэл тухайн категорийн файлын нэр
        if (!q) return true;
        if (name.toLowerCase().includes(q)) return true;
        const fs = filesByCategory.get(name) || [];
        return fs.some((f) => f.filename.toLowerCase().includes(q));
      })
      .map((name) => {
        const meta = categoryMeta.get(name);
        return {
          name,
          status: meta?.status ?? "",
          comment: meta?.comment,
          files: (filesByCategory.get(name) || []).slice().sort((a, b) =>
            a.filename.localeCompare(b.filename)
          ),
        };
      });
  }, [allCategoryNames, selectedCategory, categoryMeta, currentStatus, search, filesByCategory]);

  // “View” товч — SAS URL авч нээх
  async function handleView(f: FileRow) {
    if (!f.blobPath) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/files/url?blobPath=${encodeURIComponent(f.blobPath)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        alert("URL авахад алдаа гарлаа.");
      }
    } catch (e) {
      alert("URL авахад алдаа гарлаа.");
    }
  }

  return (
    <>
      <PageMeta title="Files by Category" description="MaterialList категориуд ба тэдгээрийн файлууд" />
      <div className="p-6 bg-gray-50 min-h-screen">
        {loading && <p className="mb-3 text-gray-500">Ачааллаж байна…</p>}

        {/* Tabs + Search + Category select */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
            <Tab.List className="flex flex-wrap gap-2">
              {viewLabels.map((label) => (
                <Tab
                  key={label}
                  className={({ selected }) =>
                    cx(
                      "px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none",
                      selected ? "bg-blue-100 text-blue-600" : "text-gray-600"
                    )
                  }
                >
                  <span className="mr-2">{label}</span>
                  <span className="inline-flex items-center justify-center min-w-6 h-6 text-xs px-2 rounded-full bg-gray-100 text-gray-700">
                    {tabCounts[label]}
                  </span>
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
{/* 
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories or files…"
                className="w-full pl-3 pr-9 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <AiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-56 px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {allCategoryNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        {/* Category blocks */}
        <div className="mt-6 space-y-3">
          {!loading && visibleCategoryBlocks.length === 0 && (
            <div className="p-6 text-center text-gray-500 bg-white rounded-2xl shadow">
              Илэрц олдсонгүй.
            </div>
          )}

          {visibleCategoryBlocks.map(({ name, status, comment, files }) => {
            const isOpen = !!open[name];
            return (
              <div key={name} className="bg-white rounded-2xl shadow overflow-hidden">
                {/* Header */}
                <button
                  className="w-full flex items-center justify-between p-4"
                  onClick={() => setOpen((o) => ({ ...o, [name]: !isOpen }))}
                >
                  <div className="flex items-center gap-3 text-left">
                    <ChevronDown
                      size={18}
                      className={cx("transition-transform", isOpen ? "rotate-180" : "rotate-0")}
                    />
                    <div>
                      <div className="font-semibold">{name}</div>
                      <div className="text-xs text-gray-500">{files.length} файл</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {comment && (
                      <span className="hidden sm:inline text-xs text-gray-500 max-w-[320px] truncate">
                        {comment}
                      </span>
                    )}
                    <span
                      className={cx(
                        "px-2 py-1 rounded text-xs",
                        status === "Баталсан" && "bg-green-100 text-green-700",
                        status === "Хүлээгдэж буй" && "bg-amber-100 text-amber-700",
                        status === "Цуцалсан" && "bg-red-100 text-red-700",
                        status === "Шаардлага хангаагүй" && "bg-red-100 text-red-700",
                        status === "Илгээгээгүй" && "bg-gray-100 text-gray-600",
                        !status && "bg-gray-100 text-gray-600"
                      )}
                    >
                      {status || "Статусгүй"}
                    </span>
                  </div>
                </button>

                {/* Files table */}
                {isOpen && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                            File name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                            Last uploaded
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                            Comment
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {files.length === 0 ? (
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-500" colSpan={5}>
                              Энэ категорид файл алга.
                            </td>
                          </tr>
                        ) : (
                          files.map((f) => (
                            <tr key={`${name}-${f.id}`} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-800">{f.filename}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{f.status}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{f.uploadedAt}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{f.comment || ""}</td>
                              <td className="px-4 py-2 text-sm">
                                <button
                                  onClick={() => handleView(f)}
                                  disabled={f.username !== username} 
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${
    f.username !== username
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-blue-500 hover:bg-blue-600 text-white"
  }`}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}