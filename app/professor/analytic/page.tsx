"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from "recharts"

export default function ProfessorAnalyticPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Professor Analytics</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">+12% from last semester</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">B+</div>
                <p className="text-xs text-muted-foreground">+3% from last semester</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5h</div>
                <p className="text-xs text-muted-foreground">+4h from last month</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Course Attendance</CardTitle>
                <CardDescription>Student attendance over the semester</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    lectures: {
                      label: "Lectures",
                      theme: {
                        light: "#a67c52",
                        dark: "#a67c52"
                      }
                    },
                    labs: {
                      label: "Labs",
                      theme: {
                        light: "#7d5a3c",
                        dark: "#7d5a3c"
                      }
                    },
                    officeHours: {
                      label: "Office Hours",
                      theme: {
                        light: "#d4a276",
                        dark: "#d4a276"
                      }
                    }
                  }}
                >
                  <LineChart
                    data={[
                      { week: "Week 1", lectures: 95, labs: 85, officeHours: 20 },
                      { week: "Week 2", lectures: 90, labs: 88, officeHours: 25 },
                      { week: "Week 3", lectures: 87, labs: 82, officeHours: 30 },
                      { week: "Week 4", lectures: 85, labs: 80, officeHours: 35 },
                      { week: "Week 5", lectures: 83, labs: 78, officeHours: 40 },
                      { week: "Week 6", lectures: 80, labs: 75, officeHours: 45 },
                      { week: "Week 7", lectures: 78, labs: 72, officeHours: 50 },
                      { week: "Week 8", lectures: 75, labs: 70, officeHours: 55 },
                      { week: "Week 9", lectures: 73, labs: 68, officeHours: 58 },
                      { week: "Week 10", lectures: 70, labs: 65, officeHours: 60 },
                    ]}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                    <Line type="monotone" dataKey="lectures" stroke="var(--color-lectures)" strokeWidth={2} />
                    <Line type="monotone" dataKey="labs" stroke="var(--color-labs)" strokeWidth={2} />
                    <Line type="monotone" dataKey="officeHours" stroke="var(--color-officeHours)" strokeWidth={2} />
                    <ChartLegend content={<ChartLegendContent className="mt-2" />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Distribution of grades this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[300px]"
                  config={{
                    A: {
                      label: "A",
                      theme: {
                        light: "#8b5a2b",
                        dark: "#8b5a2b"
                      }
                    },
                    B: {
                      label: "B",
                      theme: {
                        light: "#a67c52",
                        dark: "#a67c52"
                      }
                    },
                    C: {
                      label: "C",
                      theme: {
                        light: "#c19a6b",
                        dark: "#c19a6b"
                      }
                    },
                    D: {
                      label: "D",
                      theme: {
                        light: "#d4a276",
                        dark: "#d4a276"
                      }
                    },
                    F: {
                      label: "F",
                      theme: {
                        light: "#e6be8a",
                        dark: "#e6be8a"
                      }
                    }
                  }}
                >
                  <PieChart>
                    <Pie
                      data={[
                        { grade: "A", students: 65 },
                        { grade: "B", students: 95 },
                        { grade: "C", students: 55 },
                        { grade: "D", students: 20 },
                        { grade: "F", students: 10 },
                      ]}
                      dataKey="students"
                      nameKey="grade"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {[
                        { grade: "A", students: 65 },
                        { grade: "B", students: 95 },
                        { grade: "C", students: 55 },
                        { grade: "D", students: 20 },
                        { grade: "F", students: 10 },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.grade})`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Assignments</CardTitle>
                <CardDescription>Assignment completion rate by week</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer
                  className="h-[250px]"
                  config={{
                    completed: {
                      label: "Completed",
                      theme: {
                        light: "#8b5a2b",
                        dark: "#8b5a2b"
                      }
                    },
                    late: {
                      label: "Late",
                      theme: {
                        light: "#a67c52",
                        dark: "#a67c52"
                      }
                    },
                    missing: {
                      label: "Missing",
                      theme: {
                        light: "#d4a276",
                        dark: "#d4a276"
                      }
                    },
                  }}
                >
                  <BarChart
                    data={[
                      { name: "Week 1", completed: 210, late: 25, missing: 10 },
                      { name: "Week 2", completed: 200, late: 30, missing: 15 },
                      { name: "Week 3", completed: 190, late: 40, missing: 15 },
                      { name: "Week 4", completed: 195, late: 35, missing: 15 },
                      { name: "Week 5", completed: 185, late: 45, missing: 15 },
                      { name: "Week 6", completed: 180, late: 50, missing: 15 },
                      { name: "Week 7", completed: 170, late: 55, missing: 20 },
                      { name: "Week 8", completed: 175, late: 45, missing: 25 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="var(--color-completed)" stackId="a" />
                    <Bar dataKey="late" fill="var(--color-late)" stackId="a" />
                    <Bar dataKey="missing" fill="var(--color-missing)" stackId="a" />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement</CardTitle>
                <CardDescription>Participation metrics over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer
                  className="h-[250px]"
                  config={{
                    questions: {
                      label: "Questions",
                      theme: {
                        light: "#8b5a2b",
                        dark: "#8b5a2b"
                      }
                    },
                    discussions: {
                      label: "Discussions",
                      theme: {
                        light: "#a67c52",
                        dark: "#a67c52"
                      }
                    },
                    submissions: {
                      label: "Extra Submissions",
                      theme: {
                        light: "#d4a276",
                        dark: "#d4a276"
                      }
                    },
                  }}
                >
                  <AreaChart
                    data={[
                      { week: "Week 1", questions: 45, discussions: 25, submissions: 5 },
                      { week: "Week 2", questions: 50, discussions: 35, submissions: 8 },
                      { week: "Week 3", questions: 55, discussions: 40, submissions: 10 },
                      { week: "Week 4", questions: 65, discussions: 45, submissions: 12 },
                      { week: "Week 5", questions: 70, discussions: 50, submissions: 15 },
                      { week: "Week 6", questions: 75, discussions: 55, submissions: 18 },
                      { week: "Week 7", questions: 80, discussions: 60, submissions: 20 },
                      { week: "Week 8", questions: 85, discussions: 65, submissions: 22 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="questions" stackId="1" stroke="var(--color-questions)" fill="var(--color-questions)" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="discussions" stackId="1" stroke="var(--color-discussions)" fill="var(--color-discussions)" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="submissions" stackId="1" stroke="var(--color-submissions)" fill="var(--color-submissions)" fillOpacity={0.6} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
