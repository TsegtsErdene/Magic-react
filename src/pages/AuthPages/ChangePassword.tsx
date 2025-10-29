import ChangePasswordForm from "../../components/auth/ChangePasswordForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function ChangePassword() {
  return (
    <>
      <PageMeta title="Нууц үг солих" description="Нууц үг солих" />
      <AuthLayout>
        <ChangePasswordForm />
      </AuthLayout>
    </>
  );
}