"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProfessorStore } from "@/lib/store/professorStore";

// Import step components
import NameSearchStep from "@/components/professor/NameSearchStep";
import ProfileConfirmStep from "@/components/professor/ProfileConfirmStep";
import BackgroundStep from "@/components/professor/BackgroundStep";
import PersonalityStep from "@/components/professor/PersonalityStep";
import GoalStep from "@/components/professor/GoalStep";
import LogsPanel from "@/components/professor/LogsPanel";

const TOTAL_STEPS = 5;

export default function CreateBotPage() {
  const {
    currentStep,
    setCurrentStep,
    formData,
    selectedAuthor,
    authorDetails,
    logger,
    handleSubmit
  } = useProfessorStore();

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Update handleNext to call handleSubmit on final step
  const handleNext = () => {
    logger.info(`Moving to step ${currentStep + 1} of ${TOTAL_STEPS}`);

    if (currentStep === 1) {
      logger.success(`Bot name set to: ${formData.name}`);
      if (selectedAuthor) {
        logger.info(`Associated with author ID: ${selectedAuthor.id}`);
      }
    }

    if (currentStep === 2) {
      logger.success(`Profile confirmed for: ${authorDetails?.display_name || formData.name}`);
      if (authorDetails?.summary_stats) {
        logger.info(`Academic metrics - h-index: ${authorDetails.summary_stats.h_index}, i10-index: ${authorDetails.summary_stats.i10_index}`);
      }
      if (selectedAuthor && authorDetails) {
        logger.info(`OpenAlex data will be saved to database for ${selectedAuthor.display_name}`);
      }
    }

    if (currentStep === 3) {
      logger.info(
        `Background information set: ${formData.experience.substring(0, 50)}...`
      );
    }

    if (currentStep === 4) {
      logger.info(
        `Personality set: ${formData.personality.substring(0, 50)}...`
      );
      if (formData.personalityTags.length > 0) {
        logger.info(`Personality tags: ${formData.personalityTags.join(", ")}`);
      }
    }

    if (currentStep === 5) {
      logger.info(`Goal set: ${formData.goal}`);
      handleSubmit();
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      logger.info(`Moving back to step ${currentStep - 1}`);
      setCurrentStep(currentStep - 1);
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        // Need a name and selected author
        return !formData.name.trim() || !selectedAuthor;
      case 2:
        // Need to have loaded author details
        return !authorDetails;
      case 3:
        return !formData.experience.trim();
      case 4:
        return (
          !formData.personality.trim() && formData.personalityTags.length === 0
        );
      case 5:
        return !formData.goal.trim();
      default:
        return false;
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <NameSearchStep />;
      case 2:
        return <ProfileConfirmStep />;
      case 3:
        return <BackgroundStep />;
      case 4:
        return <PersonalityStep />;
      case 5:
        return <GoalStep />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <Link
          href="/professor"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bots
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex gap-6 h-[calc(100vh-15rem)]">
        {/* Left side - Form */}
        <Card className="w-1/2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create Your Bot</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                size="sm"
              >
                Back
              </Button>
              <Button onClick={handleNext} disabled={isNextDisabled()} size="sm">
                {currentStep === TOTAL_STEPS ? "Create Bot" : "Next Step"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-22rem)]">
            <div className="space-y-6">
              {renderStepContent()}
            </div>
          </CardContent>
        </Card>

        {/* Right side - Log panel */}
        <div className="w-1/2">
          <LogsPanel />
        </div>
      </div>
    </div>
  );
}
