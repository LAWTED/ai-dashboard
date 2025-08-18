"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, GraduationCap, Building, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

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
};

export default function ProfessorChatPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);

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

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-4xl font-normal font-londrina">Professor Chat</h1>
            <p className="text-muted-foreground">Chat with AI professors based on real academic profiles</p>
          </div>
        </div>
        <Link href="/professor-chat/select">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Select Professor
          </Button>
        </Link>
      </div>

      {professors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professors.map((professor) => (
            <Card key={professor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-londrina font-normal text-2xl">
                  {professor.name}
                  <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Ready
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {professor.institution}
                  {professor.country_code && (
                    <span className="text-gray-500">({professor.country_code})</span>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-medium">{professor.works_count}</span>
                      <span className="text-gray-500">publications</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{professor.cited_by_count}</span>
                      <span className="text-gray-500">citations</span>
                    </div>
                  </div>

                  {professor.h_index && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">h-index:</span> {professor.h_index}
                    </div>
                  )}

                  {professor.topics && professor.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {professor.topics.slice(0, 3).map((topic, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                      {professor.topics.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{professor.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    Added: {new Date(professor.selectedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <Link href={`/professor-chat/${professor.id}`}>
                  <Button className="w-full flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Start Chat
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Professors Selected
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Select a professor to start chatting. Our AI will roleplay as the professor based on their real academic profile and research.
          </p>
          <Link href="/professor-chat/select">
            <Button size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Select Your First Professor
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}