"use client";

import { useSession } from "next-auth/react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useMemo } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { StatsCardSkeleton } from "@/components/dashboard/stats-card-skeleton";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function Home() {
  const { data: session } = useSession();

  // Date ranges for queries - use useMemo to prevent infinite re-renders
  const { today, monthStart, monthEnd, thirtyDaysAgo, sixMonthsData } =
    useMemo((): {
      today: Date;
      monthStart: Date;
      monthEnd: Date;
      thirtyDaysAgo: Date;
      sixMonthsData: Array<{
        start: Date;
        end: Date;
        label: string;
      }>;
    } => {
      const now = new Date();
      const currentMonth = startOfMonth(now);

      // Generate data for last 6 months including current month
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(currentMonth, i);
        months.push({
          start: startOfMonth(monthDate),
          end: endOfMonth(monthDate),
          label: monthDate.toLocaleDateString("en-US", { month: "short" }),
        });
      }

      return {
        today: now,
        monthStart: startOfMonth(now),
        monthEnd: endOfMonth(now),
        thirtyDaysAgo: subDays(now, 30),
        sixMonthsData: months,
      };
    }, []);

  // Get recent transactions
  const { data: recentTransactionsData, isLoading: recentTransactionsLoading } =
    api.transaction.getTransactions.useQuery(
      {
        from: thirtyDaysAgo,
        to: today,
        limit: 10,
        offset: 0,
      },
      {
        enabled: !!session?.user,
      },
    );

  // Get data for the last 6 months
  const sixMonthsIncome = sixMonthsData.map((month) =>
    api.transaction.getSummary.useQuery(
      {
        from: month.start,
        to: month.end,
        type: "income",
      },
      {
        enabled: !!session?.user,
      },
    ),
  );

  const sixMonthsExpenses = sixMonthsData.map((month) =>
    api.transaction.getSummary.useQuery(
      {
        from: month.start,
        to: month.end,
        type: "expense",
      },
      {
        enabled: !!session?.user,
      },
    ),
  );

  // Get current monthly data (for stats cards)
  const { data: monthlyIncome, isLoading: monthlyIncomeLoading } =
    api.transaction.getSummary.useQuery(
      {
        from: monthStart,
        to: monthEnd,
        type: "income",
      },
      {
        enabled: !!session?.user,
      },
    );

  const { data: monthlyExpenses, isLoading: monthlyExpensesLoading } =
    api.transaction.getSummary.useQuery(
      {
        from: monthStart,
        to: monthEnd,
        type: "expense",
      },
      {
        enabled: !!session?.user,
      },
    );

  // Check if any stats data is loading
  const isStatsLoading =
    monthlyIncomeLoading || monthlyExpensesLoading || recentTransactionsLoading;

  // Check if chart data is loading
  const isChartLoading =
    sixMonthsIncome.some((query) => query.isLoading) ||
    sixMonthsExpenses.some((query) => query.isLoading);

  // Calculate stats from real data
  const totalMonthlyIncome =
    monthlyIncome?.reduce((sum, item) => sum + Number(item.total ?? 0), 0) ?? 0;
  const totalMonthlyExpenses =
    monthlyExpenses?.reduce((sum, item) => sum + Number(item.total ?? 0), 0) ??
    0;
  const totalBalance = totalMonthlyIncome - totalMonthlyExpenses;
  const transactionCount = recentTransactionsData?.totalCount ?? 0;

  // Prepare chart data for overview chart
  const overviewChartData = sixMonthsData.map((month, index) => {
    const incomeData = sixMonthsIncome[index]?.data;
    const expenseData = sixMonthsExpenses[index]?.data;

    const totalIncome =
      incomeData?.reduce((sum, item) => sum + Number(item.total ?? 0), 0) ?? 0;
    const totalExpense =
      expenseData?.reduce((sum, item) => sum + Number(item.total ?? 0), 0) ?? 0;

    return {
      month: month.label,
      income: totalIncome,
      expense: totalExpense,
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {session?.user?.name ? (
                <>
                  Welcome back, {session.user.name}! Here&apos;s your financial
                  overview.
                </>
              ) : (
                <Skeleton className="h-5 w-80" />
              )}
            </p>
          </div>
          <AddTransactionDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isStatsLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Balance"
                value={`$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                description="Income minus expenses this month"
                icon={DollarSign}
                trend={
                  totalBalance > 0
                    ? { value: Math.abs(totalBalance / 100), isPositive: true }
                    : undefined
                }
              />
              <StatsCard
                title="Monthly Income"
                value={`$${totalMonthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                description="Income this month"
                icon={TrendingUp}
              />
              <StatsCard
                title="Monthly Expenses"
                value={`$${totalMonthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                description="Expenses this month"
                icon={TrendingDown}
              />
              <StatsCard
                title="Transactions"
                value={transactionCount.toString()}
                description="Total transactions"
                icon={CreditCard}
              />
            </>
          )}
        </div>

        {/* Charts and Recent Transactions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <OverviewChart
              data={overviewChartData}
              isLoading={isChartLoading}
            />
          </div>
          <div className="col-span-3">
            <RecentTransactions
              transactions={
                recentTransactionsData?.transactions.map((t) => ({
                  ...t,
                  amount: Number(t.amount),
                  type: t.type as "income" | "expense",
                })) ?? []
              }
              isLoading={recentTransactionsLoading}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your finances
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {isStatsLoading ? (
              <>
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-26" />
              </>
            ) : (
              <>
                <AddTransactionDialog>
                  <Button variant="outline">Add Income</Button>
                </AddTransactionDialog>
                <AddTransactionDialog>
                  <Button variant="outline">Add Expense</Button>
                </AddTransactionDialog>
                <Button variant="outline" asChild>
                  <a href="/receipt-upload">Upload Receipt</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/reports">View Reports</a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
