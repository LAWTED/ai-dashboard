// app/page.tsx
import React from "react";

export default function Page() {
  return (
    // 父容器：锁定视口高，禁止页面层滚动
    <div
      className="
        h-dvh overflow-hidden
        bg-[radial-gradient(70%_100%_at_50%_0%,#0b1220_0%,#06080f_100%)]
        p-4 md:p-8
        pt-[env(safe-area-inset-top)]
        pb-[env(safe-area-inset-bottom)]
      "
    >
      {/* 卡片：三行网格：header / meta / scrollable */}
      <article
        className="
          mx-auto w-full max-w-3xl
          max-h-full
          rounded-3xl border border-white/10 bg-amber-400/95
          shadow-[0_10px_30px_rgba(0,0,0,0.35)]
          overflow-hidden
          grid grid-rows-[auto_auto_minmax(0,1fr)]
        "
      >
        {/* Row 1: 顶部栏（不滚动） */}
        <header className="h-[50px] md:h-[60px] px-5 md:px-6 flex items-center border-b border-black/10">
          <div className="text-sm md:text-base text-black/70">My Entries</div>
        </header>

        {/* Row 2: 标题 + 标签（不滚动） */}
        <section className="px-5 md:px-6 py-4 md:py-5 border-b border-black/10">
          <h1 className="text-4xl md:text-6xl font-extrabold italic text-[#7b2d2d] mb-3 md:mb-4">
            Reconnecting with Old University Friends
          </h1>
          <div className="flex flex-wrap gap-2">
            {["connection", "autonomy", "growth"].map((t) => (
              <span
                key={t}
                className="rounded-full bg-amber-200/70 px-3 py-1 text-xs font-medium text-[#7b2d2d] border border-[#7b2d2d]/20"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Row 3: 可滚动内容区（只有这里滚动） */}
        <main className="min-h-0 overflow-auto px-5 md:px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="aspect-video rounded-xl overflow-hidden bg-white/60" />
            <div className="aspect-video rounded-xl overflow-hidden bg-white/60" />
          </div>

          <p className="text-[15px] leading-7 text-black/85 mb-4">
            这里是短内容示例：当只有这些内容时，卡片不会被强行拉高。
          </p>

          <div className="space-y-4">
            {Array.from({ length: 60 }).map((_, i) => (
              <p key={i} className="text-[15px] leading-7 text-black/85">
                #{i + 1} 长内容用于测试滚动：你应当只看到<strong>卡片内部第三行</strong>滚动，
                标题与标签保持可见；内容短时，卡片自然变小；内容多时卡片最多铺满屏幕高。
              </p>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="rounded-xl border border-black/10 bg-amber-200/80 px-4 py-2 text-sm font-semibold">
              Design Quote
            </button>
            <button className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold">
              Delete
            </button>
          </div>
        </main>
      </article>
    </div>
  );
}