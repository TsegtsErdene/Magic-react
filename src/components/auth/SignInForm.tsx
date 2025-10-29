import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

type UserInfo = { username?: string; companyId?: string; projectName?: string };

type LoginResponse =
  | { token: string; user?: UserInfo }
  | { requiresPasswordChange: true; changeToken: string; user: UserInfo }
  | { error: string };

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const url = new URL(window.location.href);
    const cid = url.searchParams.get("cid");
    if (cid && !companyId) setCompanyId(cid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(
    () =>
      companyId.trim() !== "" &&
      username.trim() !== "" &&
      password.trim() !== "" &&
      !loading,
    [companyId, username, password, loading]
  );

  function persistAuth(token: string, uname: string, cid: string, pname: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", uname);
    localStorage.setItem("companyId", cid);
    localStorage.setItem("projectName", pname);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!canSubmit) {
      setMsg("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: companyId.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data: LoginResponse = await res.json();

      // ✅ A) Анхны нэвтрэлт — солиулах шаардлагатай
      if (res.ok && "requiresPasswordChange" in data && data.requiresPasswordChange) {
        sessionStorage.setItem("changeToken", data.changeToken);
        sessionStorage.setItem("changeUser", JSON.stringify(data.user || {}));
        navigate("/password/change");
        return;
      }

      // ✅ B) Энгийн нэвтрэлт — токентой
      if (res.ok && "token" in data && data.token) {
        const pname =
          "user" in data && data.user?.projectName ? data.user.projectName! : "";
        persistAuth(data.token, username.trim(), companyId.trim(), pname.trim());
        navigate("/");
        return;
      }

      // ❌ Алдаа
      const err =
        (!res.ok && typeof (data as any)?.error === "string" && (data as any).error) ||
        "Нэвтрэхэд алдаа гарлаа.";
      setMsg(err);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Сүлжээний алдаа.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your company ID, email and password to sign in!
            </p>
          </div>

          <div>
            <form onSubmit={handleLogin} noValidate>
              <div className="space-y-6">
                <div>
                  <Label>
                    Company ID <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="3252451"
                    type="text"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={!canSubmit}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>

                {msg && (
                  <div
                    className={`mt-2 rounded text-center py-2 px-3 ${
                      msg.toLowerCase().includes("success")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {msg}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}