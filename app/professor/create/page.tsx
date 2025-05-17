"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, X, Search, Check } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Log entry type for system logs
type LogEntry = {
  message: string;
  timestamp: number;
  level: "info" | "error" | "warning" | "debug";
  color?: string;
};

// Author type from OpenAlex API
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

const TOTAL_STEPS = 4;

const personalityExamples = [
  "Supportive and validating",
  "Focused on creating belonging",
  "Asks thoughtful questions",
  "Patient and empathetic",
];

const experienceExamples = [
  "Stanford Professor of Psychology and Education",
  "Expert in social psychology and educational interventions",
  "Author of 'Belonging: The Science of Creating Connection'",
  "Research focuses on identity and belonging",
];

type Question = {
  question: string;
  storage_key: string;
  storage_type: string;
  example_response: string;
};

export default function CreateBotPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "Geoffrey L. Cohen",
    personality: "I believe in creating a sense of belonging for all students. My teaching approach focuses on perspective-getting - asking thoughtful questions and truly listening to answers rather than assuming I understand students' experiences. I encourage reflection on core values and provide constructive feedback with high expectations while expressing confidence in students' abilities to meet those standards. I create situations that allow students to thrive by reducing threats to belonging and identity.",
    personalityTags: ["Supportive and validating", "Focused on creating belonging"] as string[],
    experience: "I am Geoffrey L. Cohen, the James G. March Professor of Organizational Studies in Education and Business at Stanford University. I completed my Ph.D. at Stanford in Psychology and have been researching social psychology and educational interventions for over two decades. My work examines how people protect and maintain identity, with a focus on belonging and stereotype threat in educational settings.",
    experienceTags: ["Stanford Professor of Psychology and Education", "Expert in social psychology and educational interventions"] as string[],
    goal: "My goal is to help students develop a sense of belonging in their academic journey by offering tailored, targeted, and timely guidance. I want to collect information about students' backgrounds, interests, and concerns, then use this to help them navigate the graduate school application process. I aim to identify and address belonging uncertainties, provide constructive feedback that conveys high expectations coupled with belief in their abilities, and help them understand that challenges in the process are normal and not indicative of their potential for success.",
    questions: [
      {
        question: "你是申请PhD吗？还是Master呀？",
        storage_key: "degree_type",
        storage_type: "string",
        example_response: "赞赞！\\读PhD还是挺香的，哈哈，还可以全奖吃喝玩乐～"
      },
      {
        question: "你是什么时候打算申呢？",
        storage_key: "application_cycle",
        storage_type: "year",
        example_response: "Okk！\\今年申请季的话，学校是9月份就开始开放网申系统了哈\\到时你就可以提交申请啦\\大部分PhD项目都是12月中截止\\不过有些学校ddl超级早～比如Stanford、普林、Michigan是12月1号就截啦"
      },
      {
        question: "你目前科研细分领域有定下来吗？你自己最感兴趣的area或者research keywords这样子～",
        storage_key: "specific_area",
        storage_type: "text",
        example_response: "噢噢，做X方向很酷呀！\\我们系A就是做这个方向的"
      }
    ] as Question[]
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // ANSI color codes constants
  const COLORS = {
    RED: "\u001b[31m",
    GREEN: "\u001b[32m",
    YELLOW: "\u001b[33m",
    BLUE: "\u001b[34m",
    MAGENTA: "\u001b[35m",
    CYAN: "\u001b[36m",
    RESET: "\u001b[0m",
  };

  // Logger functions
  const logger = {
    info: (message: string) => {
      const logEntry = {
        message,
        timestamp: Date.now(),
        level: "info" as const,
      };
      addLog(logEntry);
      console.log(`INFO: ${message}`);
    },
    error: (message: string) => {
      const logEntry = {
        message: `${COLORS.RED}Error: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "error" as const,
        color: "red",
      };
      addLog(logEntry);
      console.error(`ERROR: ${message}`);
    },
    warning: (message: string) => {
      const logEntry = {
        message: `${COLORS.YELLOW}Warning: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "warning" as const,
        color: "yellow",
      };
      addLog(logEntry);
      console.warn(`WARNING: ${message}`);
    },
    debug: (message: string) => {
      const logEntry = {
        message: `${COLORS.BLUE}Debug: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "debug" as const,
        color: "blue",
      };
      addLog(logEntry);
      console.debug(`DEBUG: ${message}`);
    },
    success: (message: string) => {
      const logEntry = {
        message: `${COLORS.GREEN}${message}${COLORS.GREEN}`,
        timestamp: Date.now(),
        level: "info" as const,
        color: "green",
      };
      addLog(logEntry);
      console.log(`SUCCESS: ${message}`);
    },
  };

  // Add log
  const addLog = (logEntry: LogEntry) => {
    setLogs((prev) => {
      // Keep logs within limit
      const MAX_LOGS = 100;
      const newLogs = [...prev, logEntry];
      if (newLogs.length > MAX_LOGS) {
        return newLogs.slice(-MAX_LOGS);
      }
      return newLogs;
    });
  };

  // Format date time for logs
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Scroll logs to bottom when they change
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Search for authors when name changes
  const searchAuthors = async () => {
    if (!formData.name.trim()) return;

    setIsSearching(true);
    setAuthors([]);
    setSelectedAuthor(null);

    try {
      logger.info(`Searching for author: ${formData.name}`);
      const response = await fetch(`https://api.openalex.org/authors?search=${encodeURIComponent(formData.name)}&mailto=lawtedwu@gmail.com`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAuthors(data.results);
        logger.success(`Found ${data.results.length} authors matching "${formData.name}"`);
      } else {
        logger.info(`No authors found for "${formData.name}"`);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to search authors: ${error.message}`);
      } else {
        logger.error('Failed to search authors: Unknown error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Select an author
  const handleSelectAuthor = (author: Author) => {
    setSelectedAuthor(author);
    logger.success(`Selected author: ${author.display_name}`);
    logger.info(`Author OpenAlex ID: ${author.id}`);

    // Automatically update the name field
    setFormData({
      ...formData,
      name: author.display_name
    });
  };

  // Submit handler for the final step
  const handleSubmit = async () => {
    logger.info('Submitting professor info to Supabase...');
    try {
      const supabase = createClient();
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        logger.error('You must be logged in to create a bot.');
        return;
      }
      // Merge experience tags into experience text
      const experienceFull = formData.experienceTags.length > 0
        ? `${formData.experience}\n\nTags: ${formData.experienceTags.join(', ')}`
        : formData.experience;
      // Merge personality tags into personality text
      const personalityFull = formData.personalityTags.length > 0
        ? `${formData.personality}\n\nTags: ${formData.personalityTags.join(', ')}`
        : formData.personality;
      const { error } = await supabase.from('profinfo').insert([
        {
          name: formData.name,
          experience: experienceFull,
          personality: personalityFull,
          goal: formData.goal,
          creator_id: user.id,
          author_id: selectedAuthor?.id || null,
        }
      ]);
      if (error) {
        logger.error('Failed to submit professor info: ' + error.message);
      } else {
        logger.success('Professor info submitted to Supabase!');
        toast.success('Bot created successfully!');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        logger.error('Unexpected error: ' + e.message);
      } else {
        logger.error('Unexpected error: ' + String(e));
      }
    }
  };

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
      logger.info(`Background information set: ${formData.experience.substring(0, 50)}...`);
      if (formData.experienceTags.length > 0) {
        logger.info(`Background tags: ${formData.experienceTags.join(", ")}`);
      }
    }

    if (currentStep === 3) {
      logger.info(`Personality set: ${formData.personality.substring(0, 50)}...`);
      if (formData.personalityTags.length > 0) {
        logger.info(`Personality tags: ${formData.personalityTags.join(", ")}`);
      }
    }

    if (currentStep === 4) {
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

      // Removing message-related logic when going back
      setCurrentStep(currentStep - 1);
    }
  };

  const addTag = (type: "personality" | "experience", tag: string) => {
    if (type === "personality") {
      if (!formData.personalityTags.includes(tag)) {
        setFormData({
          ...formData,
          personalityTags: [...formData.personalityTags, tag],
        });
      }
    } else {
      if (!formData.experienceTags.includes(tag)) {
        setFormData({
          ...formData,
          experienceTags: [...formData.experienceTags, tag],
        });
      }
    }
  };

  const removeTag = (
    type: "personality" | "experience",
    tagToRemove: string
  ) => {
    if (type === "personality") {
      setFormData({
        ...formData,
        personalityTags: formData.personalityTags.filter(
          (tag) => tag !== tagToRemove
        ),
      });
    } else {
      setFormData({
        ...formData,
        experienceTags: formData.experienceTags.filter(
          (tag) => tag !== tagToRemove
        ),
      });
    }
  };

  // Add startup log
  useEffect(() => {
    logger.success("Bot creation interface loaded");
    logger.info("Ready to configure your personalized professor bot");
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-lg font-medium">What&apos;s your name?</Label>
              <div className="text-sm text-gray-500 mb-2">
                This will help personalize your bot&apos;s experience
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="text-base p-3 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchAuthors}
                  disabled={isSearching || !formData.name.trim()}
                >
                  {isSearching ? "Searching..." : "Search"}
                  {!isSearching && <Search className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {/* Author Search Results */}
              {authors.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Select your profile:</Label>
                  <div className="mt-2 grid gap-2">
                    {authors.map((author) => (
                      <div
                        key={author.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedAuthor?.id === author.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => handleSelectAuthor(author)}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{author.display_name}</div>
                            {selectedAuthor?.id === author.id && (
                              <Check className="h-5 w-5 text-blue-500 ml-2 opacity-100 transition-opacity" />
                            )}
                            {selectedAuthor?.id !== author.id && (
                              <Check className="h-5 w-5 text-blue-500 ml-2 opacity-0 transition-opacity" />
                            )}
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>{author.works_count} publications · {author.cited_by_count} citations</span>
                            {author.last_known_institutions && author.last_known_institutions.length > 0 && (
                              <span className="text-gray-600">
                                {author.last_known_institutions[0].display_name}
                                {author.last_known_institutions[0].country_code && ` (${author.last_known_institutions[0].country_code})`}
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
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="experience" className="text-lg font-medium">What&apos;s your background?</Label>
              <div className="text-sm text-gray-500 mb-2">
                Describe your expertise, experience, and knowledge areas. This
                will help define your capabilities as a professor.
              </div>
              <div className="space-y-2">
                <Textarea
                  id="experience"
                  placeholder="Describe your background and expertise..."
                  className="min-h-[120px] w-full text-base p-3"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.experienceTags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag("experience", tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <Label className="text-sm font-medium text-gray-700">Quick Add Background:</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {experienceExamples.map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      className="text-xs hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => addTag("experience", example)}
                      disabled={formData.experienceTags.includes(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
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
                  onChange={(e) =>
                    setFormData({ ...formData, personality: e.target.value })
                  }
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
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal" className="text-lg font-medium">What&apos;s your goal as an AI professor?</Label>
              <div className="text-sm text-gray-500 mb-2">
                Define your primary mission and what you aim to help students achieve.
              </div>
              <div className="space-y-2">
                <Textarea
                  id="goal"
                  placeholder="Describe your goals and how you plan to help students..."
                  className="min-h-[120px] w-full text-base p-3"
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return !formData.name.trim();
      case 2:
        return (
          !formData.experience.trim() && formData.experienceTags.length === 0
        );
      case 3:
        return (
          !formData.personality.trim() && formData.personalityTags.length === 0
        );
      case 4:
        return !formData.goal.trim();
      default:
        return false;
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
          <CardHeader>
            <CardTitle>Create Your Bot</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[calc(100vh-22rem)]">
            <div className="space-y-6">
              {renderStepContent()}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isNextDisabled()}>
                  {currentStep === TOTAL_STEPS ? "Create Bot" : "Next Step"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Log panel (replacing chat interface) */}
        <div className="w-1/2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>System Logs</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setLogs([])}>
                  Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 bg-black/90 text-gray-200 font-mono text-xs rounded-b-lg">
                  {logs.map((log, index) => {
                    // Parse ANSI color codes
                    let content = log.message;

                    // Define color classes based on log level or color
                    let textColorClass = "";
                    if (log.color === "red") textColorClass = "text-red-400";
                    else if (log.color === "green") textColorClass = "text-green-400";
                    else if (log.color === "yellow") textColorClass = "text-yellow-400";
                    else if (log.color === "blue") textColorClass = "text-blue-400";
                    else if (log.color === "magenta") textColorClass = "text-fuchsia-400";
                    else if (log.color === "cyan") textColorClass = "text-cyan-400";
                    else if (log.level === "error") textColorClass = "text-red-400";
                    else if (log.level === "warning") textColorClass = "text-yellow-400";
                    else if (log.level === "debug") textColorClass = "text-blue-400";
                    else textColorClass = "text-gray-300";

                    // Remove ANSI color codes for display
                    content = content.replace(/\u001b\[\d+m/g, "");

                    return (
                    <div
                      key={index}
                        className="mb-1 py-1 border-b border-gray-800"
                      >
                        <span className="text-gray-500">
                          [{formatDateTime(log.timestamp)}]
                        </span>{" "}
                        <span className={textColorClass}>{content}</span>
                    </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
