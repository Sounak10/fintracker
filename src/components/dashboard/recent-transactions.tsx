"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// Type that matches the backend response
interface Transaction {
  id: number;
  type: string; // Backend returns string, we cast it
  category: string | null;
  amount: number; // We'll convert Decimal to number
  description: string | null;
  date: Date;
  userId: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({
  transactions = [],
  isLoading,
}: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card className="h-[413px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent className="h-[313px]">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-[413px] flex-col">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/transactions">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="-mr-2 h-full overflow-y-auto pr-2">
          {transactions.length === 0 ? (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs">
                  Start by adding your first transaction!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 8).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center space-x-4"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                      transaction.type === "income"
                        ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="size-4" />
                    ) : (
                      <ArrowDownRight className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-sm leading-none font-medium">
                      {transaction.description ??
                        `${transaction.type} transaction`}
                    </p>
                    <div className="text-muted-foreground flex items-center text-xs">
                      {transaction.category && (
                        <Badge variant="secondary" className="mr-2 text-xs">
                          {transaction.category}
                        </Badge>
                      )}
                      <span>
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`shrink-0 text-sm font-medium tabular-nums ${
                      transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
