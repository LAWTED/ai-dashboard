// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

export function generateViewport() {
  return {
    themeColor: "#ffffff",
  };
}

export default function LoginPage() {
  // const router = useRouter();

  // // 检查用户是否已经登录
  // useEffect(() => {
  //   const checkUser = () => {
  //     if (typeof window !== "undefined") {
  //       const currentUser = localStorage.getItem("currentUser");
  //       if (currentUser) {
  //         router.push("/social-journal");
  //       }
  //     }
  //   };
  //   checkUser();
  // }, [router]);

  return (
    <div className="min-h-[100dvh] bg-transparent pointer-events-none">
      {/* 页面只作为背景，登录交互通过点击 Spline Letter Cover 实现 */}
    </div>
  );
}
