import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfessorStore } from "@/lib/store/professorStore";
import { toast } from "sonner";

export default function BackgroundStep() {
  const {
    formData,
    updateFormData,
    selectedAuthor,
    logger
  } = useProfessorStore();

  // Generate background content based on selected author
  const generateBackground = async () => {
    try {
      logger.info("Generating background content...");

      // Create a prompt based on the selected author or name
      const promptName = selectedAuthor?.display_name || formData.name;
      const promptContent = `Generate a comprehensive academic background for ${promptName}. Include information about their expertise, experience, research areas, and significant contributions to their field. The content should be written in first person perspective.`;

      // Show loading state
      updateFormData({ experience: "Generating background..." });

      // Call the API with timeout and error handling
      logger.info("Calling API with proxy-enabled fetch...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const response = await fetch('/api/professor/generate-background', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: promptContent,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Server responded with status: ${response.status}`);
        }

        // Parse the response
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to generate background');
        }

        // Update the form with the generated content
        updateFormData({ experience: data.text });
        logger.success("Background generated successfully!");
        toast.success("Background generated successfully!");
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          logger.error("Request timed out after 60 seconds");
          toast.error("Request timed out. Please try again.");
        } else {
          throw fetchError;
        }
      }
    } catch (error: unknown) {
      console.error('Error generating background:', error);
      updateFormData({ experience: formData.experience || "" });
      logger.error(`Failed to generate background: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Failed to generate background. Check console for details.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="experience" className="text-lg font-medium">
          What&apos;s your background?
        </Label>
        <div className="text-sm text-gray-500 mb-2">
          Describe your expertise, experience, and knowledge areas. This
          will help define your capabilities as a professor.
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={generateBackground}
            >
              Generate Background
            </Button>
          </div>
          <Textarea
            id="experience"
            placeholder="Describe your background and expertise..."
            className="min-h-[120px] w-full text-base p-3"
            value={formData.experience}
            onChange={(e) => updateFormData({ experience: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}