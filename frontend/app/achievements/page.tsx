"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";

export default function AchievementsPage() {
  const achievements = useQuery({
    queryKey: ["achievements"],
    queryFn: api.getAchievements,
  });

  if (achievements.isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (achievements.isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load achievements</p>
          <button onClick={() => achievements.refetch()} className="text-primary underline">Try again</button>
        </div>
      </div>
    );
  }

  const earned = achievements.data?.filter((a) => a.earned) || [];
  const locked = achievements.data?.filter((a) => !a.earned) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground mt-1">
          {earned.length} of {(achievements.data || []).length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Earned achievements */}
        {earned.map((a) => (
          <Card key={a.key} className="border-primary/30">
            <CardContent className="flex items-start gap-4 pt-6">
              <span className="text-4xl">{a.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.description}</p>
                {a.earned_at && (
                  <p className="text-xs text-primary mt-2">
                    Earned {a.earned_at}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Locked achievements */}
        {locked.map((a) => (
          <Card key={a.key} className="opacity-50">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="relative">
                <span className="text-4xl grayscale">{a.emoji}</span>
                <span className="absolute -top-1 -right-1 text-sm">🔒</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
