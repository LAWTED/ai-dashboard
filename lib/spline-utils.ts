// Spline 工具函数
export function triggerSplineObject(objectId: string): void {
  if (
    typeof window !== "undefined" &&
    (
      window as Window & {
        splineApp?: {
          findObjectById: (
            id: string
          ) => { emitEvent: (event: string) => void } | undefined;
        };
      }
    ).splineApp
  ) {
    const spline = (
      window as Window & {
        splineApp?: {
          findObjectById: (
            id: string
          ) => { emitEvent: (event: string) => void } | undefined;
        };
      }
    ).splineApp;
    if (spline) {
      const obj = spline.findObjectById(objectId);
      if (obj) {
        obj.emitEvent("mouseDown");
      }
    }
  }
}

// 带重试机制的 Spline 对象触发（用于页面加载时的自动触发）
export function triggerSplineObjectWithRetry(objectId: string, maxRetries: number = 10, retryInterval: number = 200): void {
  let retryCount = 0;

  function attemptTrigger() {
    if (
      typeof window !== "undefined" &&
      (
        window as Window & {
          splineApp?: {
            findObjectById: (
              id: string
            ) => { emitEvent: (event: string) => void } | undefined;
          };
        }
      ).splineApp
    ) {
      const spline = (
        window as Window & {
          splineApp?: {
            findObjectById: (
              id: string
            ) => { emitEvent: (event: string) => void } | undefined;
          };
        }
      ).splineApp;
      if (spline) {
        const obj = spline.findObjectById(objectId);
        if (obj) {
          obj.emitEvent("mouseDown");
          return;
        }
      }
    }

    // 如果未加载，重试
    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(attemptTrigger, retryInterval);
    }
  }

  attemptTrigger();
}

// 常用的 Spline 对象 ID 常量
export const SPLINE_OBJECTS = {
  MAIL_TO_HOUSE_ANIMATION: "750b513d-499e-475d-8834-6b2471bf76c0",
  LETTER_COVER_CLOSE: "e06d2656-a566-4678-9da3-40e1fbc1a664",
  JOURNAL_CLOSE: "e71878c8-d490-47e8-a9eb-c0f52ccd1a8b",
} as const;