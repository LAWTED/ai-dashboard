import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfessorStore } from "@/lib/store/professorStore";

export default function GoalStep() {
  const { formData, updateFormData } = useProfessorStore();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="goal" className="text-lg font-medium">
          What&apos;s your goal as an AI professor?
        </Label>
        <div className="text-sm text-gray-500 mb-2">
          Define your primary mission and what you aim to help students
          achieve.
        </div>
        <div className="space-y-2">
          <Textarea
            id="goal"
            placeholder="Describe your goals and how you plan to help students..."
            className="min-h-[120px] w-full text-base p-3"
            value={formData.goal}
            onChange={(e) => updateFormData({ goal: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}