import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// Define types for TypeScript (so it doesn't complain)
interface DashboardStats {
  TotalRequired: number;
  CountMissing: number;
  CountPending: number;
  CountApproved: number;
  CountActionNeeded: number;
}

interface MissingFile {
  CategoryName: string;
  DueDate: string | null;
  comment: string | null;
}

interface DashboardData {
  stats: DashboardStats;
  missingFiles: MissingFile[];
}

interface UploadStatus {
  [key: number]: {
    isLoading: boolean;
    success: boolean;
    error: string | null;
  };
}

const AuditDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get the Auth Token from localStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token') || (storedUser ? JSON.parse(storedUser).token : null);
        
        // 2. Determine API URL (Default to localhost if env is missing)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // 3. Fetch Data
        const response = await axios.get(`${apiUrl}/api/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard", err);
        
        // Show mock data for development/demo purposes
        // Based on Power BI measurements:
        // - Баталсан: COUNT(MaterialList) where status = 'Баталсан'
        // - Хүлээгдэж буй: COUNT(MaterialList) where status = 'Хүлээгдэж буй'
        // - Буцаасан + Дутуу: COUNT(MaterialList) where status IN ('Шаардлага хангаагүй', 'Дутуу')
        // - Ирүүлээгүй: COUNT(MaterialList) where status = 'Илгээгээгүй'
        // - Нийт ирүүлэх: COUNT(MaterialList) where status != 'Хэрэггүй'
        const mockData: DashboardData = {
          stats: {
            TotalRequired: 18,  // Нийт ирүүлэх - All items except "Хэрэггүй"
            CountMissing: 5,    // Ирүүлээгүй - Items with status 'Илгээгээгүй'
            CountPending: 4,    // Хүлээгдэж буй - Items with status 'Хүлээгдэж буй'
            CountApproved: 6,   // Баталсан - Items with status 'Баталсан'
            CountActionNeeded: 3 // Буцаасан + Дутуу - Items with status 'Шаардлага хангаагүй' or 'Дутуу'
          },
          missingFiles: [
            {
              CategoryName: "АОУС-240 Залилангийн эрсдлийн үнэлгээний Асуулга",
              DueDate: "2025-12-15",
              comment: "Please upload the completed questionnaire"
            },
            {
              CategoryName: "АОУС-260 Засаглах удирдлага",
              DueDate: "2025-12-20",
              comment: null
            },
            {
              CategoryName: "Хуулчийн захидал",
              DueDate: "2025-12-10",
              comment: "Urgent - overdue"
            },
            {
              CategoryName: "АОУС-265 Дотоод хяналт",
              DueDate: "2025-12-25",
              comment: "Waiting for revision"
            },
            {
              CategoryName: "Мэдээлэл технологийн үнэлгээ",
              DueDate: "2025-12-18",
              comment: null
            }
          ]
        };
        
        setData(mockData);
        setError(null);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set loading status
    setUploadStatus(prev => ({
      ...prev,
      [fileIndex]: { isLoading: true, success: false, error: null }
    }));

    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token') || (storedUser ? JSON.parse(storedUser).token : null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentName', data?.missingFiles[fileIndex]?.CategoryName || '');

      const response = await axios.post(`${apiUrl}/api/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Success
      setUploadStatus(prev => ({
        ...prev,
        [fileIndex]: { isLoading: false, success: true, error: null }
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({
          ...prev,
          [fileIndex]: { isLoading: false, success: false, error: null }
        }));
      }, 3000);

      console.log('File uploaded:', response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setUploadStatus(prev => ({
        ...prev,
        [fileIndex]: { isLoading: false, success: false, error: errorMessage }
      }));

      // Clear error message after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({
          ...prev,
          [fileIndex]: { isLoading: false, success: false, error: null }
        }));
      }, 3000);
    }

    // Reset file input
    event.target.value = '';
  };

  const triggerFileInput = (fileIndex: number) => {
    fileInputRefs.current[fileIndex]?.click();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg m-6">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  if (!data) return null;

  const { stats, missingFiles } = data;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">📊 Audit Status Dashboard</h2>
        <p className="text-gray-600 mt-2">Real-time overview of your audit document submissions.</p>
      </div>

      {/* --- SECTION 1: KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Approved Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved</p>
              <h3 className="text-4xl font-extrabold text-gray-800 mt-2">{stats.CountApproved}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4 font-medium">✓ Files verified</p>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-4xl font-extrabold text-gray-800 mt-2">{stats.CountPending}</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-4 font-medium">⏳ Waiting for auditor</p>
        </div>

        {/* Action Needed Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Action Needed</p>
              <h3 className="text-4xl font-extrabold text-red-600 mt-2">{stats.CountActionNeeded}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
          </div>
          <p className="text-sm text-red-600 mt-4 font-medium">⚠ Rejected / Incomplete</p>
        </div>

        {/* Missing Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-400 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Not Uploaded</p>
              <h3 className="text-4xl font-extrabold text-gray-800 mt-2">{stats.CountMissing}</h3>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 font-medium">📝 Total required: {stats.TotalRequired}</p>
        </div>
      </div>

      {/* --- SECTION 2: MISSING FILES TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold text-gray-800">To Do List (Missing Documents)</h3>
          </div>
          <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-xs font-bold border border-red-200">
            {missingFiles.length} Pending
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Document Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Comment</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {missingFiles.map((file, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{file.CategoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {file.DueDate ? new Date(file.DueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic">{file.comment || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Upload Button */}
                      <button
                        onClick={() => triggerFileInput(index)}
                        disabled={uploadStatus[index]?.isLoading}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          uploadStatus[index]?.isLoading
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                        }`}
                        title="Click to upload file"
                      >
                        {uploadStatus[index]?.isLoading ? (
                          <>
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <span>Upload</span>
                          </>
                        )}
                      </button>

                      {/* Hidden File Input */}
                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current[index] = el;
                        }}
                        type="file"
                        onChange={(e) => handleUpload(e, index)}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.txt,.jpg,.png,.gif"
                      />

                      {/* Status Indicator */}
                      {uploadStatus[index]?.success && (
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-md text-xs border border-green-100 font-medium flex items-center space-x-1">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Uploaded</span>
                          </span>
                        </div>
                      )}

                      {uploadStatus[index]?.error && (
                        <div className="flex items-center space-x-1">
                          <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-md text-xs border border-orange-100 font-medium flex items-center space-x-1" title={uploadStatus[index]?.error}>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Error</span>
                          </span>
                        </div>
                      )}

                      {!uploadStatus[index]?.success && !uploadStatus[index]?.error && (
                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded-md text-xs border border-red-100">Missing</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;