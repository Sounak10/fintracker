import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4 rounded-sm" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="mb-2 h-3 w-48" />
        <div className="flex items-center">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="ml-1 h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
