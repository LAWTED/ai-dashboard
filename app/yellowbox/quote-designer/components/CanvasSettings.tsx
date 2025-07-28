import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import { cn } from "@/lib/utils";

interface CanvasSettingsProps {
  background: string;
  onBackgroundChange: (background: string) => void;
}

export function CanvasSettings({ background, onBackgroundChange }: CanvasSettingsProps) {
  const { lang } = useYellowBoxI18n();

  const backgrounds = [
    {
      id: "yellow-gradient",
      name: lang === "zh" ? "黄色渐变" : "Yellow Gradient",
      preview: "bg-gradient-to-br from-[#FEF3C7] to-[#FACC15]",
    },
    {
      id: "white",
      name: lang === "zh" ? "纯白" : "Pure White",
      preview: "bg-white",
    },
    {
      id: "blue-watercolor",
      name: lang === "zh" ? "蓝色水彩" : "Blue Watercolor",
      preview: "bg-gradient-to-br from-blue-100 to-blue-300",
    },
    {
      id: "sunset",
      name: lang === "zh" ? "日落" : "Sunset",
      preview: "bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200",
    },
    {
      id: "vintage",
      name: lang === "zh" ? "复古纸张" : "Vintage Paper",
      preview: "bg-[#F5E6D3]",
    },
  ];

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-sm font-semibold text-[#3B3109] mb-3">
        {lang === "zh" ? "背景" : "Background"}
      </h3>
      <div className="flex gap-2">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onBackgroundChange(bg.id)}
            className={cn(
              "relative w-12 h-12 rounded-lg border-2 transition-all",
              background === bg.id
                ? "border-[#C04635] scale-110"
                : "border-[#E4BE10] hover:border-[#C04635]"
            )}
            title={bg.name}
          >
            <div className={cn("w-full h-full rounded-md", bg.preview)} />
          </button>
        ))}
      </div>
    </div>
  );
}