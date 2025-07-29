import React, { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import { AiOutlineSearch, AiFillFile } from "react-icons/ai";
import PageMeta from "../components/common/PageMeta";

// interface FileItem {
//   id: number;
//   name: string;
//   size: string;
//   uploaded: string;
//   category: string;
// }

interface FileRow {
  id: number;
  category: string;
  filename: string;
  status: string;
  blobPath: string;
  uploadedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Files: React.FC = () => {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    setLoading(true);
    fetch(`${API_URL}/api/files?userId=${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => { console.log(data); setFiles(data) })
      .finally(() => setLoading(false));
  }, []);

  

  // const allFiles: FileItem[] = [
  //   { id: 1, name: "Captions.fig", size: "56MB", uploaded: "Feb 11, 2023", category: "Design" },
  //   { id: 2, name: "Security.st.mp4", size: "33MB", uploaded: "Feb 11, 2023", category: "Video" },
  //   { id: 3, name: "Illustrations.svg", size: "18MB", uploaded: "Feb 11, 2023", category: "Graphics" },
  //   { id: 4, name: "Comments.fig", size: "20MB", uploaded: "Feb 11, 2023", category: "Design" },
  //   { id: 5, name: "3Dmotions.rar", size: "32MB", uploaded: "Feb 10, 2023", category: "Archive" },
  //   { id: 6, name: "Motions Audios.mp3", size: "46MB", uploaded: "Feb 10, 2023", category: "Audio" },
  //   // ... potentially 100+ more categories
  // ];

const viewLabels = [
  "Бүгд",
  "Хүлээгдэж буй",
  "Баталсан",
  "Цуцалсан",
  "Шаардлага хангаагүй"
];
const statusValues = [
  "",
  "Хүлээгдэж буй",
  "Баталсан",
  "Цуцалсан",
  "Шаардлага хангаагүй"
];

  const categories = Array.from(
    new Set(files.map((file) => file.category))
  ).sort();

const filteredFiles = files.filter((file) => {
  const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === "" || file.category === selectedCategory;
  const matchesStatus =
    statusValues[tabIndex] === "" || file.status === statusValues[tabIndex];
  return matchesSearch && matchesCategory && matchesStatus;
});
  return (
    <>
      <PageMeta title="Files" description="Browse and manage your files" />

      <div className="p-6 bg-gray-50 min-h-screen">
        {loading ? <p>Ачааллаж байна...</p> : null}
        {/* Upload Area */}
        {/* <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800">
          <AiOutlineUpload className="h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Image must be 800 x 400px – Max 20Mb
          </p>
        </div> */}

        {/* Tabs, Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between  space-y-4 md:space-y-0">
          <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
            <Tab.List className="flex space-x-4">
              {viewLabels.map((label, idx) => (
                <Tab
                  key={idx}
                  className={({ selected }) =>
                    `px-4 py-2 text-sm font-bold focus:outline-none ${
                      selected
                        ? 'bg-blue-100 text-blue-600 rounded-xl'
                        : 'text-gray-600 dark:text-gray-400'
                    }`
                  }
                >
                  {label}
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full md:w-auto">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-48 mt-2 sm:mt-0 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* File Table */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow mt-6 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" className="h-4 w-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  File name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Last uploaded
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3 flex items-center space-x-2">
                    <AiFillFile className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-100">
                      {file.filename}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-100">
                    {file.status}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-100">
                    {file.uploadedAt}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-100">
                    {file.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Files;
