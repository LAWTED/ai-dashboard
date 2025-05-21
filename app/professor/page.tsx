import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Building } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function ProfessorPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData.user?.email || "Not logged in";

  // Fetch professors from the profinfo table with detail field
  const { data: professors, error } = await supabase
    .from("profinfo")
    .select("id, name, detail");

  if (error) {
    console.error("Error fetching professors:", error);
  }

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
        {professors &&
          professors.map((professor) => (
            <Card
              key={professor.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {professor.name}
                  <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                </CardTitle>
                <CardDescription>Professor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {professor.detail && (
                    <>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-3.5 w-3.5 mr-1.5" />
                        <span>
                          {professor.detail.institution ||
                            "Unknown Institution"}
                        </span>
                        {professor.detail.country_code && (
                          <span className="ml-1 text-gray-500">
                            ({professor.detail.country_code})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">
                          {professor.detail.works_count || 0}
                        </span>
                        <span className="text-gray-500">publications</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium mr-2">
                          {professor.detail.cited_by_count || 0}
                        </span>
                        <span className="text-gray-500">citations</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Edit</Button>
                <Button>Chat</Button>
              </CardFooter>
            </Card>
          ))}
        {professors && professors.length === 0 && (
          <div className="col-span-3 text-center py-10">
            <p className="text-muted-foreground">
              No professors found. Create one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
