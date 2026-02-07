"use client";

import { Card, CardContent } from "@/components/ui/card";
import ExternalLink from "@/components/ui/ExternalLink";
import { GraduationCap } from "lucide-react";
import type { CourseContent } from "@/lib/types/creator";

interface CourseListProps {
  courses: CourseContent[];
}

export default function CourseList({ courses }: CourseListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Courses</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course, i) => (
          <Card
            key={i}
            className="group transition-all hover:border-primary/30"
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-xl bg-primary/10 p-3">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.platform}
                </p>
                {course.url && (
                  <ExternalLink
                    href={course.url}
                    className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    showIcon
                  >
                    View Course
                  </ExternalLink>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
