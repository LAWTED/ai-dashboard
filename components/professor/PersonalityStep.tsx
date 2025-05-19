import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useProfessorStore } from "@/lib/store/professorStore";

// Example tags for quick selection
const personalityExamples = [
  "Supportive and validating",
  "Focused on creating belonging",
  "Asks thoughtful questions",
  "Patient and empathetic",
];

export default function PersonalityStep() {
  const { formData, updateFormData, addTag, removeTag } = useProfessorStore();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="personality" className="text-lg font-medium">
          Describe your teaching style and personality
        </Label>
        <div className="text-sm text-gray-500 mb-2">
          How would you like to interact with students? Consider aspects
          like teaching style, communication approach, and mentoring
          philosophy.
        </div>
        <div className="space-y-2">
          <Textarea
            id="personality"
            placeholder="Describe your teaching style and personality..."
            className="min-h-[120px] w-full text-base p-3"
            value={formData.personality}
            onChange={(e) => updateFormData({ personality: e.target.value })}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.personalityTags.map((tag) => (
              <div
                key={tag}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag("personality", tag)}
                  className="hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Label className="text-sm font-medium text-gray-700">
            Quick Add Teaching Style:
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {personalityExamples.map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-blue-50 hover:text-blue-700"
                onClick={() => addTag("personality", example)}
                disabled={formData.personalityTags.includes(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
