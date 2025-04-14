export default function ReadmePage() {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Platform Documentation</h1>

        <div className="prose dark:prose-invert">
          <h2>Introduction</h2>
          <p>
            The AI Platform is a comprehensive system for managing and testing AI APIs. It provides a unified interface to access and test various AI services.
          </p>

          <h2>Features</h2>
          <ul>
            <li><a href="/alice/demo">Alice Demo</a> - Test Alice service</li>
            <li>More APIs coming soon...</li>
          </ul>

          <h2>How to Use</h2>
          <ol>
            <li>Select the API you want to test from the sidebar</li>
            <li>Follow the instructions on the page</li>
            <li>View the API response</li>
          </ol>
        </div>
      </div>
    </div>
  );
}