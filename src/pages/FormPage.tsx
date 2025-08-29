// src/pages/FormsPage.tsx
import { Tab } from "@headlessui/react";
import PageMeta from "../components/common/PageMeta";

type FormDef = { key: string; title: string; url: string };

const forms: FormDef[] = [
  {
    key: "aous240",
    title: "АОУС-240 Залилангийн эрсдлийн үнэлгээний Асуулга",
    url: "https://share.teamforms.app/form/ZGQzZjVhOWMtNTIwMy00NTZlLWJmYTQtMTllYWVmOTc1ZTVmOjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4Yjo0MjFkNjE2Ny1iMTZiLTQ4ZTItOGQ3ZS03OGExZDcxN2E3ZTA=?embedMode=true",
  },
  {
    key: "aous260",
    title: "АОУС-260 Засаглах удирдлага",
    url: "https://share.teamforms.app/form/MWEzOTVmMjktYmRlZi00ZjhkLWI5ZmEtOWVhZWY0YWMzY2ZmOjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4YjpiZmQ0MWJlNy03MzFkLTQyOGMtODIwMC1lZDZkOTQ1ZjgwOGY=?embedMode=true",
  },
  {
    key: "aous265",
    title: "АОУС-265 Дотоод хяналт",
    url: "https://share.teamforms.app/form/NjBhZmE0YmUtMDRiOS00ZjBmLTg3YTAtNmUwNzc0MWY0YzJjOjVhYzE3NWQxLTdmOGUtNGI3OC05MmYwLWZjZjk1MDJiYjI4YjpjZTlmNzc2OS05ZTQwLTRmZGUtYWI3Zi00MTIxZTBmYzQwMzc=?embedMode=true",
  },
];

function cx(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export default function FormsPage() {
  return (
    <>
      <PageMeta title="Forms" description="АОУС forms бөглөх хэсэг" />
      <div className="p-6 bg-gray-50 min-h-screen">
        <Tab.Group>
          {/* Topmenu — Files.tsx-тэй ижил мэдрэмж */}
          <Tab.List className="flex flex-wrap gap-2">
            {forms.map((f) => (
              <Tab
                key={f.key}
                className={({ selected }) =>
                  cx(
                    "px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none",
                    selected ? "bg-blue-100 text-blue-600" : "text-gray-600"
                  )
                }
              >
                {f.title}
              </Tab>
            ))}
          </Tab.List>

          {/* Сонгосон form-ийн iframe (гарчиг/товчгүй) */}
          <Tab.Panels className="mt-4">
            {forms.map((f) => (
              <Tab.Panel key={f.key}>
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <iframe
                    title={f.title}
                    src={f.url}
                    frameBorder={0}
                    marginWidth={0}
                    marginHeight={0}
                    allowFullScreen
                    allow="geolocation; clipboard-read; clipboard-write"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[80vh] block"
                  />
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}
