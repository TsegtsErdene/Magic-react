import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Select, { components, MultiValue, OptionProps } from "react-select";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "react-circular-progressbar/dist/styles.css";

type Category = { label: string; value: string };




interface UploadFile {
  file: File;
  name: string;
  type: string;
  size: number;
  preview?: string;
  categories: Category[];
}

const CheckboxOption = (props: OptionProps<Category, true>) => (
  <components.Option {...props}>
    <input
      type="checkbox"
      checked={props.isSelected}
      onChange={() => null}
      className="mr-2"
    />
    <label>{props.label}</label>
  </components.Option>
);

const API_URL = import.meta.env.VITE_API_URL;

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [modalFileIndex, setModalFileIndex] = useState<number | null>(null);
  const [progresses, setProgresses] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<(string | null)[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data =>  setCategories(data.map(
      (c: any) => ({ label: c.CategoryName, value: c.CategoryName })
    )));
}, []);

useEffect(() => {
  console.log("categories UPDATED:", categories);
}, [categories]);
  

  // Файл нэмэх
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithMeta: UploadFile[] = acceptedFiles.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: URL.createObjectURL(file),
      categories: [],
    }));
    setFiles(prev => [...prev, ...filesWithMeta]);
    setProgresses(prev => [...prev, ...filesWithMeta.map(() => 0)]);
    setUploadResults(prev => [...prev, ...filesWithMeta.map(() => null)]);
  }, []);

  // Категори өөрчлөх
  const handleCategoryChange = (index: number, categories: MultiValue<Category>) => {
    setFiles(prev =>
      prev.map((file, i) =>
        i === index ? { ...file, categories: Array.isArray(categories) ? categories : [] } : file
      )
    );
  };

  // Файл устгах
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setProgresses(prev => prev.filter((_, i) => i !== index));
    setUploadResults(prev => prev.filter((_, i) => i !== index));
  };

  // Бүх файлд категори сонгосон эсэхийг шалгах
  const hasFileWithoutCategory = files.some(f => !f.categories.length);

  // Upload
  async function uploadAllFiles() {
    setUploading(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    const newResults = [...uploadResults];

    for (let idx = 0; idx < files.length; idx++) {
      const fileObj = files[idx];
      if (!fileObj.categories.length) {
        newResults[idx] = "⚠ Категори сонгоогүй!";
        continue;
      }
      setProgresses(prev => {
        const copy = [...prev];
        copy[idx] = 0;
        return copy;
      });

      const formData = new FormData();
      formData.append("file", fileObj.file);
      fileObj.categories.forEach(cat => formData.append("categories[]", cat.value));
      try {
        await axios.post(`${API_URL}/api/files/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: progressEvent => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgresses(prev => {
              const copy = [...prev];
              copy[idx] = percent;
              return copy;
            });
          },
        });
        newResults[idx] = "✅ Амжилттай";
      } catch (e) {
        newResults[idx] = "❌ Алдаа";
      }
    }
    setUploading(false);
    setUploadResults(newResults);
    setMessage("Upload дууслаа!");
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer transition ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">Drag & drop files here, or click to select</p>
      </div>
      <ul className="mt-4 w-full">
        {files.map((file, idx) => (
          <li
            key={file.name + idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-100 rounded-xl px-3 py-2 mb-2"
          >
            <div className="flex items-center gap-2">
              {file.type.startsWith("image/") && file.preview && (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-8 h-8 object-cover rounded-md"
                />
              )}
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-gray-400 ml-2">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                className="px-2 py-1 rounded border bg-white hover:bg-blue-50 text-sm"
                onClick={() => setModalFileIndex(idx)}
              >
                {file.categories.length > 0
                  ? `Categories (${file.categories.length})`
                  : "Select categories"}
              </button>
              <button
                className="text-red-500 hover:text-red-700 font-medium ml-1"
                onClick={e => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
              >
                Remove
              </button>
            </div>
            {/* БӨӨРӨНХИЙ PROGRESS BAR + ICON */}
            {(uploading || uploadResults[idx]) && (
              <div className="flex flex-col items-center mt-2">
                <div style={{ width: 44, height: 44, position: "relative" }}>
                  <CircularProgressbar
                    value={progresses[idx] || 0}
                    text={
                      uploadResults[idx] === "✅ Амжилттай"
                        ? ""
                        : uploadResults[idx] === "❌ Алдаа"
                        ? ""
                        : `${progresses[idx] || 0}%`
                    }
                    styles={buildStyles({
                      pathColor:
                        uploadResults[idx] === "✅ Амжилттай"
                          ? "#22c55e"
                          : uploadResults[idx] === "❌ Алдаа"
                          ? "#ef4444"
                          : "#2563eb",
                      textColor: "#1e293b",
                      trailColor: "#d1d5db",
                      textSize: "28px",
                    })}
                  />
                  {(uploadResults[idx] === "✅ Амжилттай" ||
                    uploadResults[idx] === "❌ Алдаа") && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      {uploadResults[idx] === "✅ Амжилттай" ? (
                        <FaCheckCircle className="text-green-500" size={28} />
                      ) : (
                        <FaTimesCircle className="text-red-500" size={28} />
                      )}
                    </span>
                  )}
                </div>
                <div className="text-xs mt-1 text-center">{uploadResults[idx]}</div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {files.length > 0 && (
        <div className="flex flex-col items-end mt-3">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            onClick={uploadAllFiles}
            disabled={uploading || !files.length || hasFileWithoutCategory}
          >
            {uploading ? "Uploading..." : "Upload All"}
          </button>
          {hasFileWithoutCategory && (
            <div className="text-xs text-red-500 mt-1">
              Бүх файл дээр категори сонгоно уу!
            </div>
          )}
        </div>
      )}
      {modalFileIndex !== null && files[modalFileIndex] && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999999]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px]">
            <h3 className="mb-2 text-lg font-bold">Select categories</h3>
            <Select
              options={categories}
              isMulti
              isSearchable
              closeMenuOnSelect={false}
              value={files[modalFileIndex]?.categories ?? []}
              onChange={categories => handleCategoryChange(modalFileIndex, categories)}
              className="mb-4"
              styles={{
                menu: base => ({ ...base, zIndex: 9999 }),
                control: base => ({
                  ...base,
                  backgroundColor: "white",
                  color: "black",
                }),
                option: base => ({
                  ...base,
                  color: "black",
                  backgroundColor: "white"
                }),
              }}
              placeholder="Type to search..."
              components={{ Option: CheckboxOption }}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-100"
                onClick={() => setModalFileIndex(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                onClick={() => setModalFileIndex(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {message && (
        <div className="mt-4 p-2 text-center rounded bg-blue-50 text-blue-700">{message}</div>
      )}
    </div>
  );
};

export default FileUploader;
