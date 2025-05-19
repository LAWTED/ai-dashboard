import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Check } from "lucide-react";
import { useProfessorStore } from "@/lib/store/professorStore";
import { useEffect } from "react";

export default function NameSearchStep() {
  const {
    formData,
    updateFormData,
    isSearching,
    authors,
    selectedAuthor,
    setSelectedAuthor,
    searchAuthors,
    fetchAuthorDetails,
    logger
  } = useProfessorStore();

  // Handle author selection
  const handleSelectAuthor = (author: typeof selectedAuthor) => {
    if (!author) return;

    setSelectedAuthor(author);
    logger.success(`Selected author: ${author.display_name}`);
    logger.info(`Author OpenAlex ID: ${author.id}`);

    // Fetch detailed author information
    fetchAuthorDetails(author.id);

    // Automatically update the name field
    updateFormData({ name: author.display_name });
  };

  // Add startup log when component mounts
  useEffect(() => {
    logger.success("Bot creation interface loaded");
    logger.info("Ready to configure your personalized professor bot");
  }, [logger]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-lg font-medium">
          What&apos;s your name?
        </Label>
        <div className="text-sm text-gray-500 mb-2">
          This will help personalize your bot&apos;s experience
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="text-base p-3 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => searchAuthors(formData.name)}
            disabled={isSearching || !formData.name.trim()}
          >
            {isSearching ? "Searching..." : "Search"}
            {!isSearching && <Search className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        {/* Author Search Results */}
        {authors.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-medium">
              Select your profile:
            </Label>
            <div className="mt-2 grid gap-2">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAuthor?.id === author.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => handleSelectAuthor(author)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        {author.display_name}
                      </div>
                      {selectedAuthor?.id === author.id && (
                        <Check className="h-5 w-5 text-blue-500 ml-2 opacity-100 transition-opacity" />
                      )}
                      {selectedAuthor?.id !== author.id && (
                        <Check className="h-5 w-5 text-blue-500 ml-2 opacity-0 transition-opacity" />
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>
                        {author.works_count} publications ·{" "}
                        {author.cited_by_count} citations
                      </span>
                      {author.last_known_institutions &&
                        author.last_known_institutions.length > 0 && (
                          <span className="text-gray-600">
                            {
                              author.last_known_institutions[0]
                                .display_name
                            }
                            {author.last_known_institutions[0]
                              .country_code &&
                              ` (${author.last_known_institutions[0].country_code})`}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}