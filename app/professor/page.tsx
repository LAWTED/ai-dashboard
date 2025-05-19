import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

// Mock data for bots
const mockBots = [
  {
    id: 1,
    name: "Research Assistant",
    description:
      "An AI bot specialized in academic research and paper analysis",
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Teaching Assistant",
    description: "Helps with course management and student queries",
    status: "Inactive",
    lastActive: "1 day ago",
  },
];

export default async function ProfessorPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userEmail = data.user?.email || "Not logged in";

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">My Bots</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-3 w-3 mr-1" />
            <span>Current account: {userEmail}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton variant="outline" />
          <Link href="/professor/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Bot
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBots.map((bot) => (
          <Card key={bot.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {bot.name}
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    bot.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {bot.status}
                </span>
              </CardTitle>
              <CardDescription>Last active: {bot.lastActive}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{bot.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Edit</Button>
              <Button>Chat</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
