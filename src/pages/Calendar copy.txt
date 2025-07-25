import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import { AiOutlineUpload, AiOutlineSearch, AiFillFile } from "react-icons/ai";
import PageMeta from "../components/common/PageMeta";

interface FileItem {
  id: number;
  name: string;
  size: string;
  uploaded: string;
  by: { name: string; avatar: string };
}

interface PinnedItem {
  id: number;
  name: string;
}

interface Activity {
  id: number;
  user: string;
  description: string;
  time: string;
  avatar: string;
}

const Upload: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const allFiles: FileItem[] = [
    { id: 1, name: "Captions.fig", size: "56MB", uploaded: "Feb 11, 2023", by: { name: "Mr.tsegtsee", avatar: "/avatars/ali.png" } },
    { id: 2, name: "Security.st.mp4", size: "33MB", uploaded: "Feb 11, 2023", by: { name: "Mahdi_gz", avatar: "/avatars/mahdi.png" } },
    { id: 3, name: "Illustrations.svg", size: "18MB", uploaded: "Feb 11, 2023", by: { name: "Akbar", avatar: "/avatars/akbar.png" } },
    { id: 4, name: "Comments.fig", size: "20MB", uploaded: "Feb 11, 2023", by: { name: "Sina_g", avatar: "/avatars/sina.png" } },
    { id: 5, name: "3Dmotions.rar", size: "32MB", uploaded: "Feb 10, 2023", by: { name: "Mr.alidost", avatar: "/avatars/ali.png" } },
    { id: 6, name: "Motions Audios.mp3", size: "46MB", uploaded: "Feb 10, 2023", by: { name: "Sina_g", avatar: "/avatars/sina.png" } },
  ];

  const pinnedItems: PinnedItem[] = [
    { id: 1, name: "Iconly pro.fig" },
    { id: 2, name: "3D Motions.Rar" },
    { id: 3, name: "Comments.txt" },
  ];

  const activities: Activity[] = [
    { id: 1, user: "You", description: "added HomeIcons story", time: "20:13", avatar: "/avatars/you.png" },
    { id: 2, user: "Mr.alidost", description: "added Captions", time: "18:04", avatar: "/avatars/ali.png" },
    { id: 3, user: "Akbar", description: "added Filename", time: "17:47", avatar: "/avatars/akbar.png" },
    { id: 4, user: "Sina_g", description: "added Comments", time: "15:03", avatar: "/avatars/sina.png" },
  ];

  const viewLabels = ["View all", "Your files", "Shared files"];

  // simple filter: for demo purposes, uses tabIndex & searchTerm only
  const filteredFiles = allFiles.filter(file => {
    const matchSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    // no real per-tab filtering logic here
    return matchSearch;
  });

  return (
    <>
      <PageMeta title="File Manager" description="Browse and manage your files" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-gray-50 min-h-screen">
        {/* Main Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800">
            <AiOutlineUpload className="h-10 w-10 text-gray-400" />
            <p className="mt-3 text-gray-600 dark:text-gray-300">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Image must be 800 x 400px – Max 20Mb</p>
          </div>

          {/* Tabs & Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
              <Tab.List className="flex space-x-4">
                {viewLabels.map((label, idx) => (
                  <Tab
                    key={label}
                    className={({ selected }) =>
                      `px-4 py-2 text-sm font-medium focus:outline-none ${
                        selected ? 'bg-blue-100 text-blue-600 rounded-xl' : 'text-gray-600 dark:text-gray-400'
                      }`
                    }
                  >
                    {label}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>

            <div className="relative mt-4 md:mt-0">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-3 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* File Table */}
          <div className="overflow-x-auto bg-white rounded-2xl shadow dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3"><input type="checkbox" className="h-4 w-4" /></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">File name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">File size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Last uploaded</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Upload by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4" /></td>
                    <td className="px-4 py-3 flex items-center space-x-2">
                      <AiFillFile className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-100">{file.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-100">{file.size}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-100">{file.uploaded}</td>
                    <td className="px-4 py-3 flex items-center space-x-2">
                      <img src={file.by.avatar} alt={file.by.name} className="h-6 w-6 rounded-full" />
                      <span className="text-sm text-gray-700 dark:text-gray-100">{file.by.name}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Memory */}
          <div className="bg-white p-4 rounded-2xl shadow dark:bg-gray-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Memory</h4>
            <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center dark:bg-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">62% filled (182/250GB)</span>
            </div>
          </div>

          {/* Pinned Items */}
          <div className="bg-white p-4 rounded-2xl shadow dark:bg-gray-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pinned Items</h4>
            <ul className="space-y-2">
              {pinnedItems.map(item => (
                <li key={item.id} className="flex items-center space-x-2">
                  <AiFillFile className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-100">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activities */}
          <div className="bg-white p-4 rounded-2xl shadow dark:bg-gray-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Activities</h4>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {activities.map(act => (
                <li key={act.id} className="flex items-start space-x-3">
                  <img src={act.avatar} alt={act.user} className="h-6 w-6 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-100">
                      <span className="font-medium">{act.user}</span> {act.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{act.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
