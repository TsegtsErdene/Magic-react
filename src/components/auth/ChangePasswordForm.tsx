import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";

function passOk(pw: string) {
  const checks =
    (/[a-z]/.test(pw) ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  return pw.length >= 8 && checks >= 3;
}

export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const changeToken = sessionStorage.getItem("changeToken");
  const changeUser = useMemo(() => {
    const raw = sessionStorage.getItem("changeUser");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!changeToken) {
    navigate("/signin", { replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (newPassword !== confirm) return setMsg("New passwords do not match");
    if (!passOk(newPassword))
      return setMsg(
        "Use at least 8 characters and include 3 of: upper/lower/number/symbol."
      );

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/password/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${changeToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Failed to change password");
        return;
      }

      sessionStorage.removeItem("changeToken");
      sessionStorage.removeItem("changeUser");
      setMsg("Password changed successfully. Please sign in with your new password.");
      setTimeout(() => navigate("/signin", { replace: true }), 700);
    } catch (e: any) {
      setMsg(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    currentPassword.trim() && newPassword.trim() && confirm.trim() && !loading;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Нууц үг солих
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Сайн байна уу{changeUser?.username ? `, ${changeUser.username}` : ""}. Үргэлжлүүлэхээс өмнө нууц үгээ шинэчилнэ үү.
            </p>
          </div>

          <div>
            <form onSubmit={submit} noValidate>
              <div className="space-y-6">
                {/* Current password */}
                <div>
                  <Label>Current password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      type={show1 ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrent(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow1(!show1)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={show1 ? "Hide password" : "Show password"}
                    >
                      {show1 ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <Label>New password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      type={show2 ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNew(e.target.value)}
                      placeholder="New password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow2(!show2)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={show2 ? "Hide password" : "Show password"}
                    >
                      {show2 ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      At least 8 chars; include 3 of: upper/lower/number/symbol.
                    </p>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <Label>Confirm new password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      type={show3 ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow3(!show3)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={show3 ? "Hide password" : "Show password"}
                    >
                      {show3 ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={!canSubmit}>
                    {loading ? "Updating..." : "Update password"}
                  </Button>
                </div>

                {msg && (
                  <div
                    className={`mt-2 rounded text-center py-2 px-3 ${
                      msg.toLowerCase().includes("successfully") ||
                      msg.toLowerCase().includes("changed")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {msg}
                  </div>
                )}

                <button
                  type="button"
                  className="text-sm text-gray-500 hover:underline"
                  onClick={() => navigate("/signin")}
                >
                  Back to sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
