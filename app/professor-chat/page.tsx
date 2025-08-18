"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  MessageCircle, 
  GraduationCap, 
  Building, 
  BookOpen, 
  Search,
  Check,
  ArrowLeft,
  Download,
  Trash2
} from "lucide-react";
import { WeChatChat, Message } from "@/components/ui/wechat-chat";

// Types
type Professor = {
  id: string;
  name: string;
  institution: string;
  country_code?: string;
  works_count: number;
  cited_by_count: number;
  h_index?: number;
  topics?: string[];
  selectedAt: string;
  fullDetails?: Record<string, unknown>;
};

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

type UserQueue = {
  messages: string[];
  lastMessageTime: number;
};

type ViewMode = 'default' | 'add-professor' | 'chat';

export default function ProfessorChatPage() {
  // Professor list state
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  
  // Add professor state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [userQueue, setUserQueue] = useState<UserQueue>({
    messages: [],
    lastMessageTime: 0,
  });
  const [processingQueue, setProcessingQueue] = useState(false);

  // Chat constants
  const TYPING_SPEED = 20;
  const QUEUE_WAITING_TIME = 1500;

  // Load saved professors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("professor-chat-list");
    if (saved) {
      try {
        const parsedProfessors = JSON.parse(saved);
        setProfessors(parsedProfessors);
      } catch (error) {
        console.error("Failed to load professors:", error);
      }
    }
  }, []);

  // Chat functionality (from [id]/page.tsx)
  const displayAssistantResponse = async (response: string) => {
    setTyping(true);

    if (response.includes("\\")) {
      const parts = response
        .split("\\")
        .map((part) => part.trim())
        .filter(Boolean);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const typingDelay = part.length * TYPING_SPEED;
        await new Promise((resolve) => setTimeout(resolve, typingDelay));

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: part,
            timestamp: Date.now(),
          },
        ]);

        if (i < parts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } else {
      const typingDelay = response.length * TYPING_SPEED;
      await new Promise((resolve) => setTimeout(resolve, typingDelay));

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        },
      ]);
    }

    setTyping(false);
  };

  const processUserQueue = useCallback(async () => {
    if (processingQueue || !selectedProfessor) return;
    
    setProcessingQueue(true);
    setLoading(true);

    try {
      const userMessages = [...userQueue.messages];
      setUserQueue({ messages: [], lastMessageTime: 0 });

      const mergedMessage = userMessages.length > 1 
        ? userMessages.join(" ") 
        : userMessages[0];

      const conversationHistory = messages
        .slice(0, -userMessages.length)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch("/api/professor-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: mergedMessage,
          professorId: selectedProfessor.id,
          conversationHistory,
          professorDetails: selectedProfessor.fullDetails,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await displayAssistantResponse(data.response);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble responding right now. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setProcessingQueue(false);
    }
  }, [processingQueue, selectedProfessor, userQueue.messages, messages]);

  useEffect(() => {
    if (userQueue.messages.length === 0 || processingQueue || loading || typing) {
      return;
    }

    const timeSinceLastMessage = Date.now() - userQueue.lastMessageTime;
    
    if (timeSinceLastMessage >= QUEUE_WAITING_TIME) {
      processUserQueue();
    } else {
      const remainingTime = QUEUE_WAITING_TIME - timeSinceLastMessage;
      const timer = setTimeout(() => {
        processUserQueue();
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [userQueue, processingQueue, loading, typing, processUserQueue]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || !selectedProfessor) return;

    const timestamp = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp,
      },
    ]);

    setUserQueue((prev) => ({
      messages: [...prev.messages, userMessage],
      lastMessageTime: timestamp,
    }));
  };

  // Add professor functionality (from select/page.tsx)
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
      const response = await fetch(
        `https://api.openalex.org/people/${author.id.split('/').pop()}?mailto=lawtedwu@gmail.com`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

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

  const confirmSelection = async () => {
    if (!selectedAuthor || !authorDetails) return;

    const newProfessor = {
      id: selectedAuthor.id.split('/').pop() || '',
      name: selectedAuthor.display_name,
      institution: selectedAuthor.last_known_institutions?.[0]?.display_name || "Unknown Institution",
      country_code: selectedAuthor.last_known_institutions?.[0]?.country_code,
      works_count: selectedAuthor.works_count,
      cited_by_count: selectedAuthor.cited_by_count,
      h_index: authorDetails.summary_stats?.h_index,
      topics: authorDetails.topics?.slice(0, 5).map(t => t.display_name),
      selectedAt: new Date().toISOString(),
      fullDetails: authorDetails
    };

    const savedProfessors = JSON.parse(localStorage.getItem("professor-chat-list") || "[]");
    const existingIndex = savedProfessors.findIndex((p: { id: string }) => p.id === newProfessor.id);
    
    if (existingIndex >= 0) {
      savedProfessors[existingIndex] = newProfessor;
    } else {
      savedProfessors.push(newProfessor);
    }

    localStorage.setItem("professor-chat-list", JSON.stringify(savedProfessors));
    setProfessors(savedProfessors);

    // Start chat with new professor
    setSelectedProfessor(newProfessor);
    setViewMode('chat');
    setSearchQuery("");
    setAuthors([]);
    setSelectedAuthor(null);
    setAuthorDetails(null);
    
    // Load chat history or show welcome message
    const chatHistoryKey = `professor-chat-history-${newProfessor.id}`;
    const savedMessages = localStorage.getItem(chatHistoryKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        showWelcomeMessage(newProfessor);
      }
    } else {
      showWelcomeMessage(newProfessor);
    }
  };

  const showWelcomeMessage = (professor: Professor) => {
    const welcomeMessage = `Hi there! I'm Professor ${professor.name} from ${professor.institution}\\Great to meet you\\What would you like to chat about today? My research, academic life, or anything else you're curious about~`;
    setMessages([]);
    displayAssistantResponse(welcomeMessage);
  };

  const startChatWithProfessor = (professor: Professor) => {
    setSelectedProfessor(professor);
    setViewMode('chat');
    
    // Load chat history
    const chatHistoryKey = `professor-chat-history-${professor.id}`;
    const savedMessages = localStorage.getItem(chatHistoryKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        showWelcomeMessage(professor);
      }
    } else {
      showWelcomeMessage(professor);
    }
  };

  const exportChatHistory = () => {
    if (messages.length === 0 || !selectedProfessor) return;

    const BOM = "\uFEFF";
    const rows = messages.map((msg) => {
      const timestamp = new Date(msg.timestamp).toISOString();
      const role = msg.role;
      const content = msg.content.replace(/"/g, '""');
      return `"${timestamp}","${role}","${content}"`;
    });

    const csvContent = BOM + "Timestamp,Role,Content\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date();
    const filename = `${selectedProfessor.name.replace(/\s+/g, '_')}_chat_history_${date.toISOString().split("T")[0]}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearChatHistory = () => {
    if (messages.length === 0 || !selectedProfessor) return;
    
    setMessages([]);
    
    const chatHistoryKey = `professor-chat-history-${selectedProfessor.id}`;
    localStorage.removeItem(chatHistoryKey);
    
    showWelcomeMessage(selectedProfessor);
  };

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0 && selectedProfessor) {
      const chatHistoryKey = `professor-chat-history-${selectedProfessor.id}`;
      localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
    }
  }, [messages, selectedProfessor]);

  const renderModelInfo = () => {
    if (!selectedProfessor) return null;

    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <GraduationCap className="h-4 w-4 mr-2" />
        <span className="font-medium">Professor:</span>
        <span className="ml-1">{selectedProfessor.name}</span>
        <span className="mx-2">•</span>
        <Building className="h-4 w-4 mr-1" />
        <span>{selectedProfessor.institution}</span>
        {selectedProfessor.h_index && (
          <>
            <span className="mx-2">•</span>
            <span>h-index: {selectedProfessor.h_index}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Professor List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Professor Chat</h1>
          </div>
          <Button 
            onClick={() => {
              setViewMode('add-professor');
              setSearchQuery("");
              setAuthors([]);
              setSelectedAuthor(null);
              setAuthorDetails(null);
            }}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Professor
          </Button>
        </div>

        {/* Professor List */}
        <div className="flex-1 overflow-y-auto">
          {professors.length > 0 ? (
            <div className="space-y-1 p-2">
              {professors.map((professor) => (
                <div
                  key={professor.id}
                  onClick={() => startChatWithProfessor(professor)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedProfessor?.id === professor.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{professor.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {professor.institution}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {professor.works_count} publications • {professor.cited_by_count} citations
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No professors added yet</p>
              <p className="text-xs text-gray-400">Click &quot;Add Professor&quot; to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'default' && (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Welcome to Professor Chat
              </h3>
              <p className="text-gray-500 max-w-md">
                Select a professor from the sidebar to start chatting, or add a new professor to begin.
              </p>
            </div>
          </div>
        )}

        {viewMode === 'add-professor' && (
          <div className="flex-1 flex flex-col h-full">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('default')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">Add New Professor</h2>
              </div>
            </div>

            {/* Search Section - Scrollable */}
            <div className="flex-1 min-h-0 flex">
              {/* Search Form */}
              <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
                <div className="p-6 border-b border-gray-200">
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
                </div>

                {/* Search Results */}
                {authors.length > 0 && (
                  <div className="flex-1 p-6 overflow-y-auto">
                    <Label className="mb-3 block">Search Results:</Label>
                    <div className="space-y-2">
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
                  </div>
                )}
              </div>

              {/* Professor Details */}
              <div className="w-1/2 bg-gray-50 flex flex-col">
                <div className="flex-1 min-h-0 p-6 overflow-y-auto">
                {isLoadingDetails ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-gray-500">Loading professor details...</p>
                  </div>
                ) : authorDetails ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4">
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
                      <div className="bg-white rounded-lg p-4">
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
                      <div className="bg-white rounded-lg p-4">
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

                    <Button
                      onClick={confirmSelection}
                      className="w-full"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Chat with Professor
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-gray-500">Select a professor to see details</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'chat' && selectedProfessor && (
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('default')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-lg font-semibold">Professor {selectedProfessor.name}</h2>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {selectedProfessor.institution}
                      {selectedProfessor.h_index && (
                        <>
                          <span className="mx-1">•</span>
                          <span>h-index: {selectedProfessor.h_index}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={exportChatHistory}
                    variant="outline"
                    size="sm"
                    disabled={messages.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button
                    onClick={clearChatHistory}
                    variant="outline"
                    size="sm"
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Content - Scrollable */}
            <div className="flex-1 min-h-0 p-4">
              <div className="h-full">
                <WeChatChat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  disabled={false}
                  placeholder="Ask the professor anything..."
                  modelInfo={renderModelInfo()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}