/**
 * @file app/sign-in/page.tsx
 * @description Clerk 로그인 페이지
 *
 * Instagram 스타일 디자인 적용
 */

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border border-[#dbdbdb] rounded-lg bg-white",
            headerTitle: "text-2xl font-semibold text-[#262626]",
            headerSubtitle: "text-sm text-[#8e8e8e]",
            socialButtonsBlockButton:
              "border border-[#dbdbdb] hover:bg-[#fafafa]",
            formButtonPrimary: "bg-[#0095f6] hover:bg-[#1877f2]",
            formFieldInput: "border-[#dbdbdb] focus:border-[#0095f6]",
            footerActionLink: "text-[#0095f6] hover:underline",
          },
        }}
        redirectUrl="/feed"
      />
    </div>
  );
}
