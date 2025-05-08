"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const TOTAL_STEPS = 5;

const personalityExamples = [
  "Professional and formal",
  "Friendly and casual",
  "Patient and supportive",
  "Direct and concise",
];

const experienceExamples = [
  "10 years of experience in computer science research and teaching",
  "Expert in machine learning and artificial intelligence",
  "Published researcher in natural language processing",
  "Experienced mentor for graduate students",
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Question = {
  question: string;
  storage_key: string;
  storage_type: string;
  example_response: string;
};

export default function CreateBotPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    personality: "",
    personalityTags: [] as string[],
    experience: "",
    experienceTags: [] as string[],
    goal: "",
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const getMockUserResponse = (storageType: string) => {
    switch (storageType) {
      case 'year':
        return "今年吧";
      case 'string':
        return "我想申请PhD";
      case 'text':
        return "我对机器学习比较感兴趣";
      default:
        return "好的";
    }
  };

  const splitMessages = (content: string, role: "user" | "assistant"): Message[] => {
    // Split the content by backslash and filter out empty strings
    const parts = content.split('\\').filter(part => part.trim().length > 0);
    // Convert each part into a message with the given role
    return parts.map(part => ({
      role,
      content: part.trim()
    }));
  };

  const handleNext = () => {
    if (currentStep === 3) {
      // When completing step 3, send the self-introduction message
      setMessages(prev => [
        ...prev,
        {
          role: "user",
          content: `我先自我介绍下，我叫${formData.name}，中文名李星煜，本科清华，博士毕业于Stanford，目前在Stanford做research scientist（其实就是俗称的"博士后"～）。`
        }
      ]);
    }

    if (currentStep === 4) {
      // After completing goal step, add greeting message
      setMessages(prev => [
        ...prev,
        {
          role: "user",
          content: "Hello同学你好呀～ 是要申请grad school嘛？"
        }
      ]);
    }

    if (currentStep === 5) {
      // Keep existing messages (self-intro and greeting)
      const baseMessages = messages;

      // Generate preview messages
      const previewMessages: Message[] = [];
      formData.questions.forEach((q) => {
        previewMessages.push(...splitMessages(q.question, "user"));
        previewMessages.push({
          role: "assistant",
          content: getMockUserResponse(q.storage_type)
        });
        previewMessages.push(...splitMessages(q.example_response, "user"));
      });

      // Add preview messages while keeping existing ones
      setMessages([...baseMessages, ...previewMessages]);
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle form submission here
      console.log("Form submitted:", formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // If going back to step 1, clear all messages
      if (currentStep === 2) {
        setMessages([]);
      }
      // If going back from greeting message, remove it
      else if (currentStep === 5) {
        setMessages(prev => prev.slice(0, -1));
      }
      // If going back from preview, keep self-intro and greeting
      else if (currentStep === 6) {
        setMessages(prev => prev.slice(0, 2));
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: inputMessage }]);

    // Add mock assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I see you're working on creating your bot. Feel free to ask any questions about the process!",
        },
      ]);
    }, 1000);

    setInputMessage("");
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

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: newQuestions
    });

    // Update preview messages when editing table
    if (currentStep === 5) {
      // Keep messages before the questionnaire preview (self-intro and greeting)
      const baseMessages = messages.slice(0, 2);

      // Generate new preview messages
      const previewMessages: Message[] = [];
      newQuestions.forEach((q) => {
        previewMessages.push(...splitMessages(q.question, "user"));
        previewMessages.push({
          role: "assistant",
          content: getMockUserResponse(q.storage_type)
        });
        previewMessages.push(...splitMessages(q.example_response, "user"));
      });

      // Update messages with new preview
      setMessages([...baseMessages, ...previewMessages]);
    }
  };

  const handleAddQuestion = () => {
    const newQuestions = [...formData.questions];
    newQuestions.push({
      question: "",
      storage_key: "",
      storage_type: "string",
      example_response: ""
    });
    setFormData({
      ...formData,
      questions: newQuestions
    });

    // Update preview messages when adding new question
    if (currentStep === 5) {
      // Keep messages before the questionnaire preview
      const baseMessages = messages.slice(0, 1); // Keep the self-introduction

      // Generate new preview messages
      const previewMessages: Message[] = [];
      newQuestions.forEach((q) => {
        if (q.question.trim() || q.example_response.trim()) {
          previewMessages.push(...splitMessages(q.question, "user"));
          previewMessages.push({
            role: "assistant",
            content: getMockUserResponse(q.storage_type)
          });
          previewMessages.push(...splitMessages(q.example_response, "user"));
        }
      });

      // Update messages with new preview
      setMessages([...baseMessages, ...previewMessages]);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({
      ...formData,
      questions: newQuestions
    });

    // Update preview messages when removing question
    if (currentStep === 5) {
      // Keep messages before the questionnaire preview
      const baseMessages = messages.slice(0, 1); // Keep the self-introduction

      // Generate new preview messages
      const previewMessages: Message[] = [];
      newQuestions.forEach((q) => {
        previewMessages.push(...splitMessages(q.question, "user"));
        previewMessages.push({
          role: "assistant",
          content: getMockUserResponse(q.storage_type)
        });
        previewMessages.push(...splitMessages(q.example_response, "user"));
      });

      // Update messages with new preview
      setMessages([...baseMessages, ...previewMessages]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">What&apos;s your name?</Label>
              <div className="text-sm text-gray-500 mb-2">
                This will help personalize your bot&apos;s experience
              </div>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="experience">What&apos;s your background?</Label>
              <div className="text-sm text-gray-500 mb-2">
                Describe your expertise, experience, and knowledge areas. This
                will help define your capabilities as a professor.
                <br />
                Example:
                <br />
                本科毕业于清华大学，博士毕业于Stanford大学，目前在Stanford大学担任research
                scientist（博士后）。有丰富的指导学生申请研究生项目的经验，特别是PhD项目的申请。曾经带过多名成功申请到理想项目的学生。
              </div>
              <div className="space-y-2">
                <Textarea
                  id="experience"
                  placeholder="Describe your background and expertise..."
                  className="min-h-[120px]"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                />
                <div className="flex flex-wrap gap-2">
                  {formData.experienceTags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
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
              <div className="mt-4">
                <Label className="text-sm text-gray-500">Add background:</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {experienceExamples.map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      className="text-xs"
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
              <Label htmlFor="personality">
                Describe your teaching style and personality
              </Label>
              <div className="text-sm text-gray-500 mb-2">
                How would you like to interact with students? Consider aspects
                like teaching style, communication approach, and mentoring
                philosophy.
                <br />
                Example:
                <br />
                性格开朗友善，专业知识丰富，乐于分享经验，对学生非常耐心和支持。说话风格亲切随和，喜欢用轻松活泼的语气与学生交流，营造轻松的沟通氛围。
              </div>
              <div className="space-y-2">
                <Textarea
                  id="personality"
                  placeholder="Describe your teaching style and personality..."
                  className="min-h-[120px]"
                  value={formData.personality}
                  onChange={(e) =>
                    setFormData({ ...formData, personality: e.target.value })
                  }
                />
                <div className="flex flex-wrap gap-2">
                  {formData.personalityTags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
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
              <div className="mt-4">
                <Label className="text-sm text-gray-500">
                  Add teaching style:
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {personalityExamples.map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      className="text-xs"
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
              <Label htmlFor="goal">What&apos;s your goal as an AI professor?</Label>
              <div className="text-sm text-gray-500 mb-2">
                Define your primary mission and what you aim to help students achieve.
                <br />
                Example:
                <br />
                Collect students&apos; background information, and help them prepare for the application process.
              </div>
              <div className="space-y-2">
                <Textarea
                  id="goal"
                  placeholder="Describe your goals and how you plan to help students..."
                  className="min-h-[120px]"
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label>Initial Questions Setup</Label>
              <div className="text-sm text-gray-500 mb-4">
                These are the questions you&apos;ll ask to understand your students&apos; background and needs.
                Each question can be edited to match your preferred interaction style.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left">Question</th>
                      <th className="border p-2 text-left">Storage Format</th>
                      <th className="border p-2 text-left">Example Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.questions.map((q, index) => (
                      <tr key={index} className="border-b">
                        <td className="border p-2">
                          <div className="flex">
                            <Textarea
                              value={q.question}
                              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                              className="min-h-[60px] w-full"
                              placeholder="Enter your question..."
                            />
                            <Button
                              onClick={() => handleRemoveQuestion(index)}
                              variant="ghost"
                              className="ml-2 text-red-500 hover:text-red-700"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="border p-2">
                          <div className="space-y-2">
                            <Input
                              value={q.storage_key}
                              onChange={(e) => handleQuestionChange(index, 'storage_key', e.target.value)}
                              placeholder="Storage key"
                              className="mb-1"
                            />
                            <select
                              value={q.storage_type}
                              onChange={(e) => handleQuestionChange(index, 'storage_type', e.target.value)}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="string">string</option>
                              <option value="year">year</option>
                              <option value="text">text</option>
                            </select>
                          </div>
                        </td>
                        <td className="border p-2">
                          <Textarea
                            value={q.example_response}
                            onChange={(e) => handleQuestionChange(index, 'example_response', e.target.value)}
                            className="min-h-[60px] w-full"
                            placeholder="Enter example response..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAddQuestion}
                  type="button"
                  variant="outline"
                  size="sm"
                >
                  Add Question
                </Button>
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
      case 5:
        return formData.questions.some(q =>
          !q.question.trim() ||
          !q.storage_key.trim() ||
          !q.example_response.trim()
        );
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
          <CardContent>
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

        {/* Right side - Chat interface */}
        <div className="w-1/2 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-[#ebebeb] mb-4">
                <div className="flex flex-col w-full">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-[#95ec69] text-black self-end max-w-[85%]"
                          : "bg-white border border-gray-200 self-start max-w-[85%]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-[#07c160] hover:bg-[#06ad56]"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
