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
          <div className="flex flex-col gap-4">
            {/* Topmenu — Files.tsx-ийн Tab style-тай */}
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

            {/* Сонгосон form-ийн iframe */}
            <Tab.Panels>
              {forms.map((f) => (
                <Tab.Panel key={f.key}>
                  <div className="bg-white rounded-2xl shadow p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold">{f.title}</h2>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        Open
                      </a>
                    </div>

                    <div className="w-full h-[75vh]">
                      <iframe
                        title={f.title}
                        src={f.url}
                        frameBorder={0}
                        marginWidth={0}
                        marginHeight={0}
                        allowFullScreen
                        allow="geolocation; clipboard-read; clipboard-write"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full rounded-lg border"
                      />
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Хэрэв iframe ачааллахгүй бол{" "}
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        энд дарж
                      </a>{" "}
                      шууд нээгээрэй.
                    </p>
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>
    </>
  );
}
