import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Magic User нэвтрэх хэсэг"
        description="Magic User нэвтрэх хэсэг"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
