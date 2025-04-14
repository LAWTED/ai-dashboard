import { BookOpen, PlayCircle, Settings } from "lucide-react";

export default function ReadmePage() {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold mb-3">
            AI Platform Documentation
          </h1>
          <p className="text-muted-foreground">
            A comprehensive platform for managing and testing AI services
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
              <h2 className="text-xl font-semibold">Introduction</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The AI Platform is a comprehensive system for managing and testing AI APIs.
              It provides a unified interface to access and test various AI services.
            </p>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <PlayCircle className="h-5 w-5 text-muted-foreground mr-2" />
              <h2 className="text-xl font-semibold">Available Services</h2>
            </div>
            <ul className="ml-7 list-disc space-y-2 text-muted-foreground">
              <li>
                <a href="/alice/demo" className="text-primary hover:underline">
                  Alice Demo
                </a> - Test the conversational Alice service
              </li>
              <li>
                <a href="/alice/config" className="text-primary hover:underline">
                  Alice Configuration
                </a> - Adjust Alice&apos;s response timing parameters
              </li>
              <li className="text-muted-foreground/70 italic">
                More services will be added soon...
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-muted-foreground mr-2" />
              <h2 className="text-xl font-semibold">How to Use</h2>
            </div>
            <ol className="ml-7 list-decimal space-y-2 text-muted-foreground">
              <li>Select the service you want to use from the sidebar menu</li>
              <li>Configure any needed parameters in the configuration page</li>
              <li>Interact with the service and view the results in real-time</li>
            </ol>
          </section>
        </div>

        <div className="mt-16 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 AI Platform</p>
        </div>
      </div>
    </div>
  );
}