"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VADocs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white py-5 px-8 flex items-center">
        <Link href="/va" className="flex items-center text-sm font-light hover:text-blue-300 transition-colors duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to presentation
        </Link>
        <h1 className="text-xl font-light ml-6 tracking-tight">Developer Documentation</h1>
      </header>

      {/* Content */}
      <main className="flex-grow py-16 px-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-3">Values Affirmation Module</h1>
          <p className="text-xl text-gray-600 font-light mb-10">Implementation Guide for Developers</p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              This documentation provides guidance for implementing the Values Affirmation (VA)
              intervention in conversational interfaces. Based on Geoffrey Cohen&apos;s research,
              the VA intervention is designed to reduce stereotype threat, boost self-integrity,
              and improve user engagement.
            </p>
            <p className="text-gray-700">
              The module is designed to be plug-and-play, allowing for easy integration
              into various chatbot platforms including Discord, Slack, WhatsApp, and custom LLM interfaces.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Integration Process</h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700">
              <li>
                <strong>Import the VA Module:</strong> Add the module to your project as a dependency or include the source files directly.
              </li>
              <li>
                <strong>Configure the VA Settings:</strong> Customize the implementation based on your context (academic, healthcare, workplace).
              </li>
              <li>
                <strong>Connect to Your Chat Interface:</strong> Integrate the VA module with your existing conversation flow.
              </li>
              <li>
                <strong>Determine Timing:</strong> Choose when to trigger the VA intervention (e.g., before high-stress tasks).
              </li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Core Components</h2>
            <div className="grid grid-cols-1 gap-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <h3 className="font-medium text-xl text-gray-800">1. Value Prompt Component</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-700 mb-4">
                    This component presents users with a list of values and asks them to select or provide one that is important to them.
                  </p>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
{`// Example implementation
function ValuePrompt({ onSelectValue }) {
  const values = ["Achievement", "Autonomy", "Compassion", /* ... */];

  return (
    <div>
      <p>What&apos;s a value that&apos;s important to you?</p>
      <div className="values-list">
        {values.map(value => (
          <button key={value} onClick={() => onSelectValue(value)}>
            {value}
          </button>
        ))}
      </div>
      <input placeholder="Or type your own..." />
    </div>
  );
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <h3 className="font-medium text-xl text-gray-800">2. Reflection Component</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-700 mb-4">
                    After selecting a value, this component prompts users to reflect on why the value is important to them.
                  </p>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
{`// Example implementation
function ReflectionPrompt({ selectedValue, onSubmitReflection }) {
  const [reflection, setReflection] = useState("");

  return (
    <div>
      <p>
        Thank you for choosing {selectedValue}.
        Could you briefly explain why this is important to you?
      </p>
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
      />
      <button onClick={() => onSubmitReflection(reflection)}>
        Submit
      </button>
    </div>
  );
}`}
                  </pre>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <h3 className="font-medium text-xl text-gray-800">3. Affirmation Component</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-700 mb-4">
                    This component provides affirming feedback based on the user&apos;s shared value and reflection.
                  </p>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200">
{`// Example implementation
function AffirmationResponse({ selectedValue, reflection }) {
  return (
    <div>
      <p>
        Thank you for sharing your thoughts on {selectedValue}.
        Research shows that reflecting on our personal values
        can help us navigate challenges with more resilience.
      </p>
      <p>
        Your commitment to {selectedValue} is a strength that
        can guide you through difficult situations.
      </p>
    </div>
  );
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Keep it Brief:</strong> The VA intervention should take 3-5 minutes to complete.</li>
              <li><strong>Maintain Privacy:</strong> Offer anonymization options for sensitive contexts.</li>
              <li><strong>Cultural Awareness:</strong> Ensure the values list is culturally relevant to your users.</li>
              <li><strong>Timing Matters:</strong> Deploy VA before high-stakes events or challenging content.</li>
              <li><strong>Follow-up:</strong> Consider a brief follow-up VA session for reinforcement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Research References</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Cohen, G. L., Garcia, J., Apfel, N., & Master, A. (2006). Reducing the racial achievement gap: A social-psychological intervention. <em>Science, 313</em>(5791), 1307-1310.</li>
              <li>Cohen, G. L., Garcia, J., Purdie-Vaughns, V., Apfel, N., & Brzustoski, P. (2009). Recursive processes in self-affirmation: Intervening to close the minority achievement gap. <em>Science, 324</em>(5925), 400-403.</li>
              <li>Evers, A. W., Kraaimaat, F. W., Van Lankveld, W., Jongen, P. J., Jacobs, J. W., & Bijlsma, J. W. (2006). Beyond unfavorable thinking: The illness cognition questionnaire for chronic diseases. <em>Journal of Consulting and Clinical Psychology, 74</em>(5), 836-847.</li>
              <li>Creswell, J. D., Welch, W. T., Taylor, S. E., Sherman, D. K., Gruenewald, T. L., & Mann, T. (2005). Affirmation of personal values buffers neuroendocrine and psychological stress responses. <em>Psychological Science, 16</em>(11), 846-851.</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-5 px-8 text-center text-sm text-gray-500">
        <p>
          This documentation is part of the open-source Values Affirmation Module.
          <br />
          Contributions and improvements are welcome.
        </p>
      </footer>
    </div>
  );
}