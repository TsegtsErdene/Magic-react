// src/pages/FormsPage.tsx
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";

type FormDef = { key: string; title: string; url: string; fullPath: string };

const forms: FormDef[] = [
  {
    key: "AOUS-240",
    title: "АОУС-240 Залилангийн эрсдлийн үнэлгээний Асуулга",
    url: "https://share.teamforms.app/form/ZGQzZjVhOWMtNTIwMy00NTZlLWJmYTQtMTllYWVmOTc1ZTVmOjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4Yjo0MjFkNjE2Ny1iMTZiLTQ4ZTItOGQ3ZS03OGExZDcxN2E3ZTA=?embedMode=true",
    fullPath: "/forms/AOUS-240",
  },
  {
    key: "AOUS-260",
    title: "АОУС-260 Засаглах удирдлага",
    url: "https://share.teamforms.app/form/MWEzOTVmMjktYmRlZi00ZjhkLWI5ZmEtOWVhZWY0YWMzY2ZmOjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4YjpiZmQ0MWJlNy03MzFkLTQyOGMtODIwMC1lZDZkOTQ1ZjgwOGY=?embedMode=true",
    fullPath: "/forms/AOUS-260",
  },
  {
    key: "AOUS-265",
    title: "АОУС-265 Дотоод хяналт",
    url: "https://share.teamforms.app/form/NjBhZmE0YmUtMDRiOS00ZjBmLTg3YTAtNmUwNzc0MWY0YzJjOjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4YjpjZTlmNzc2OS05ZTQwLTRmZGUtYWI3Zi00MTIxZTBmYzQwMzc=?embedMode=true",
    fullPath: "/forms/AOUS-265",
  },
  // Та энд шинэ form нэмж болно:
  {
    key: "AOUS-560",
    title: "АОУС-560 Балансын дараах үйл явдал",
    url: "https://share.teamforms.app/form/MzcxNWJhMDYtMWQyNi00ZTBlLWI4MTItNjkwMzJiYjJlY2RkOjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4YjoyMTQ1MTRmNC0xMTZlLTRlNWUtYTEwZS1kYjc1YzY2MmJkYmY=",
    fullPath: "/forms/AOUS-560",
  },
  {
    key: "MTU",
    title: "Мэдээлэл технологийн үнэлгээ",
    url: "https://share.teamforms.app/form/MDExOWRiNTYtZjAyNS00YTkwLWEzMDktMTk5OTRiOWVkOWE3OjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4YjpjMjViYWE0NC04ZDdkLTQwZWQtOWQzMy02YzY2NGNmZjU3ZGU=",
    fullPath: "/forms/MTU",
  },
  {
    key: "HZ",
    title: "Хуулчийн захидал",
    url: "https://share.teamforms.app/form/YmQ1YTliYjEtNDU1Mi00NjYxLTkxNmItMWY0YmJmMjNmMjY2OjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4YjozNzJkMmUyYy1kZTllLTQyYmEtYWExYi1hYzE5OTg0Yzg2MGQ=",
    fullPath: "/forms/HZ",
  },
];

export default function FormsPage() {
  const location = useLocation();

  const active = useMemo(() => {
    // olon host-д trailing slash эсвэл params харгалзана гэсэн учраас pathname-ыг normalize хийнэ
    const pathname = location.pathname.replace(/\/+$/, "");
    return forms.find((f) => f.fullPath === pathname) || forms[0];
  }, [location.pathname]);

  return (
    <>
      <PageMeta title="Forms" description="АОУС forms бөглөх хэсэг" />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <iframe
            title={active.title}
            src={active.url}
            frameBorder={0}
            marginWidth={0}
            marginHeight={0}
            allowFullScreen
            allow="geolocation; clipboard-read; clipboard-write"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[90vh] block"
          />
        </div>
      </div>
    </>
  );
}
