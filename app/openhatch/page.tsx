import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessorDashboard } from "./components/professor-dashboard";
import { StudentDashboard } from "./components/student-dashboard";
import { HeroSection } from "./components/hero-section";
import { AiChat } from "./components/ai-chat";

export default function OpenHatchPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <HeroSection />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="professor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="professor">教授端</TabsTrigger>
              <TabsTrigger value="student">学生端</TabsTrigger>
            </TabsList>

            <TabsContent value="professor" className="mt-4">
              <ProfessorDashboard />
            </TabsContent>

            <TabsContent value="student" className="mt-4">
              <StudentDashboard />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <AiChat />
        </div>
      </div>
    </div>
  );
}