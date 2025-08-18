"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Check, Building, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Author = {
  id: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  last_known_institutions?: {
    id: string;
    display_name: string;
    country_code?: string;
  }[];
};

type AuthorDetails = {
  id: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  summary_stats?: {
    h_index: number;
    i10_index: number;
  };
  affiliations?: {
    institution: {
      display_name: string;
      country_code?: string;
    };
    years: number[];
  }[];
  topics?: {
    display_name: string;
    count: number;
  }[];
  topPapers?: {
    id: string;
    title: string;
    cited_by_count: number;
    publication_year: number;
    doi: string;
    url: string;
  }[];
};

export default function SelectProfessorPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const searchAuthors = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setAuthors([]);
    setSelectedAuthor(null);
    setAuthorDetails(null);

    try {
      const response = await fetch(
        `https://api.openalex.org/authors?search=${encodeURIComponent(
          searchQuery
        )}&mailto=lawtedwu@gmail.com`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAuthors(data.results);
      }
    } catch (error) {
      console.error("Failed to search authors:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAuthor = async (author: Author) => {
    setSelectedAuthor(author);
    setIsLoadingDetails(true);

    try {
      // Fetch author details
      const response = await fetch(
        `https://api.openalex.org/people/${author.id.split('/').pop()}?mailto=lawtedwu@gmail.com`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Fetch top papers
      const worksRes = await fetch(
        `https://api.openalex.org/works?filter=author.id:${author.id.split('/').pop()}&sort=cited_by_count:desc&per-page=10&mailto=lawtedwu@gmail.com`
      );
      
      let topPapers: Array<{
        id: string;
        title: string;
        cited_by_count: number;
        publication_year: number;
        doi: string;
        url: string;
      }> = [];
      if (worksRes.ok) {
        const worksData = await worksRes.json() as { results: Array<{
          id: string;
          title: string;
          cited_by_count: number;
          publication_year: number;
          doi: string;
          primary_location?: { source?: { url?: string }; url?: string };
        }> };
        topPapers = (worksData.results || []).slice(0, 10).map((paper) => ({
          id: paper.id,
          title: paper.title,
          cited_by_count: paper.cited_by_count,
          publication_year: paper.publication_year,
          doi: paper.doi,
          url: paper.primary_location?.source?.url || paper.primary_location?.url || '',
        }));
      }

      setAuthorDetails({ ...data, topPapers });
    } catch (error) {
      console.error("Failed to fetch author details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const confirmSelection = () => {
    if (!selectedAuthor || !authorDetails) return;

    // Save to localStorage
    const savedProfessors = JSON.parse(localStorage.getItem("professor-chat-list") || "[]");
    
    const newProfessor = {
      id: selectedAuthor.id.split('/').pop(),
      name: selectedAuthor.display_name,
      institution: selectedAuthor.last_known_institutions?.[0]?.display_name || "Unknown Institution",
      country_code: selectedAuthor.last_known_institutions?.[0]?.country_code,
      works_count: selectedAuthor.works_count,
      cited_by_count: selectedAuthor.cited_by_count,
      h_index: authorDetails.summary_stats?.h_index,
      topics: authorDetails.topics?.slice(0, 5).map(t => t.display_name),
      selectedAt: new Date().toISOString(),
      fullDetails: authorDetails // Store full details for chat
    };

    // Check if professor already exists
    const existingIndex = savedProfessors.findIndex((p: { id: string }) => p.id === newProfessor.id);
    if (existingIndex >= 0) {
      savedProfessors[existingIndex] = newProfessor;
    } else {
      savedProfessors.push(newProfessor);
    }

    localStorage.setItem("professor-chat-list", JSON.stringify(savedProfessors));

    // Navigate to chat
    router.push(`/professor-chat/${newProfessor.id}`);
  };

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <Link
          href="/professor-chat"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Professor Chat
        </Link>
      </div>

      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Left side - Search */}
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Search Professors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Professor Name</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="search"
                  placeholder="Enter professor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      searchAuthors();
                    }
                  }}
                />
                <Button
                  onClick={searchAuthors}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? "Searching..." : "Search"}
                  {!isSearching && <Search className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {authors.length > 0 && (
              <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
                <Label>Search Results:</Label>
                {authors.map((author) => (
                  <div
                    key={author.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedAuthor?.id === author.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => selectAuthor(author)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{author.display_name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {author.works_count} publications
                          </span>
                          <span>{author.cited_by_count} citations</span>
                        </div>
                        {author.last_known_institutions && author.last_known_institutions.length > 0 && (
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Building className="h-3 w-3" />
                            {author.last_known_institutions[0].display_name}
                            {author.last_known_institutions[0].country_code && (
                              <span>({author.last_known_institutions[0].country_code})</span>
                            )}
                          </div>
                        )}
                      </div>
                      {selectedAuthor?.id === author.id && (
                        <Check className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right side - Professor Details */}
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Professor Details</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-12rem)]">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">Loading professor details...</p>
              </div>
            ) : authorDetails ? (
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">{authorDetails.display_name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Publications:</span> {authorDetails.works_count}
                    </div>
                    <div>
                      <span className="font-medium">Citations:</span> {authorDetails.cited_by_count}
                    </div>
                    {authorDetails.summary_stats && (
                      <>
                        <div>
                          <span className="font-medium">h-index:</span> {authorDetails.summary_stats.h_index}
                        </div>
                        <div>
                          <span className="font-medium">i10-index:</span> {authorDetails.summary_stats.i10_index}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {authorDetails.affiliations && authorDetails.affiliations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      Affiliations
                    </h4>
                    <div className="space-y-1">
                      {authorDetails.affiliations.slice(0, 3).map((affiliation, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>{affiliation.institution.display_name}</span>
                          {affiliation.years && affiliation.years.length > 0 && (
                            <span className="text-gray-500">
                              {Math.min(...affiliation.years)}-{Math.max(...affiliation.years)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {authorDetails.topics && authorDetails.topics.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Research Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {authorDetails.topics.slice(0, 8).map((topic, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                        >
                          {topic.display_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {authorDetails.topPapers && authorDetails.topPapers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Top Publications
                    </h4>
                    <div className="space-y-3">
                      {authorDetails.topPapers.slice(0, 5).map((paper) => (
                        <div key={paper.id} className="border rounded p-3 bg-gray-50">
                          <div className="font-medium text-sm text-blue-900 mb-1">
                            {paper.title}
                          </div>
                          <div className="text-xs text-gray-600 flex flex-wrap gap-3">
                            <span>Citations: {paper.cited_by_count}</span>
                            <span>Year: {paper.publication_year}</span>
                            {paper.doi && (
                              <a
                                href={`https://doi.org/${paper.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-blue-600 hover:text-blue-800"
                              >
                                DOI
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={confirmSelection} 
                  className="w-full mt-6"
                  size="lg"
                >
                  Select This Professor & Start Chatting
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">Search and select a professor to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}