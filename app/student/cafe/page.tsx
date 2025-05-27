import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Building, Users, Coffee } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Fixed professor data
const professors = [
  {
    id: "feifei-li",
    name: "Fei-Fei Li",
    detail: {
      institution: "Stanford University",
      works_count: 300,
      cited_by_count: 150000,
      h_index: 120,
      country_code: "US"
    },
    description: "Computer Vision & AI Ethics"
  },
  {
    id: "geoffrey-l-cohen",
    name: "Geoffrey L. Cohen",
    detail: {
      institution: "Stanford University",
      works_count: 180,
      cited_by_count: 45000,
      h_index: 85,
      country_code: "US"
    },
    description: "Educational Psychology & Belonging"
  }
];

export default async function StudentCafePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData.user?.email || "Not logged in";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Coffee className="h-8 w-8 text-indigo-600" />
              <h1 className="text-4xl font-normal font-londrina text-indigo-600 dark:text-indigo-400">
                Professor Cafe
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 ml-11">
              Discover and connect with professors
            </p>
            <div className="flex items-center text-sm text-muted-foreground ml-11">
              <Mail className="h-3 w-3 mr-1" />
              <span>Logged in as: {userEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4" />
              <span>{professors.length} Professors Available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professors.map((professor) => (
            <Card
              key={professor.id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white dark:bg-slate-800"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-londrina font-normal text-2xl">
                  {professor.name}
                  <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Available
                  </span>
                </CardTitle>
                <CardDescription>{professor.description}</CardDescription>
              </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Building className="h-3.5 w-3.5 mr-1.5" />
                      <span>{professor.detail.institution}</span>
                      <span className="ml-1 text-gray-500">
                        ({professor.detail.country_code})
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">
                        {professor.detail.works_count}
                      </span>
                      <span className="text-gray-500">publications</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium mr-2">
                        {professor.detail.cited_by_count.toLocaleString()}
                      </span>
                      <span className="text-gray-500">citations</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">H-Index:</span>
                      <span>{professor.detail.h_index}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" className="flex-1">
                    View Profile
                  </Button>
                  <Link
                    href={`/student/chat?professor=${encodeURIComponent(professor.name)}`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Start Chat
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          {professors && professors.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-muted-foreground mb-2">
                No professors available yet
              </p>
              <p className="text-sm text-gray-500">
                Check back later for new professors to connect with.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Can&apos;t find the professor you&apos;re looking for?{" "}
            <Button variant="link" className="p-0 h-auto text-indigo-600">
              Request a new professor
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}