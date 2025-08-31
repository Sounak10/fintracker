"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142, 76%, 36%)",
  },
  expense: {
    label: "Expense",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

interface OverviewChartProps {
  data?: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  isLoading?: boolean;
}

export function OverviewChart({ data = [], isLoading }: OverviewChartProps) {
  // Generate dynamic sample data for the last 6 months based on current date
  const generateSampleData = () => {
    const now = new Date();
    const sampleValues = [3600, 4000, 3900, 4200, 3800, 4500]; // Income values
    const expenseValues = [2700, 3000, 2900, 3100, 2800, 3400]; // Expense values

    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1,
      );
      const monthLabel = monthDate.toLocaleDateString("en-US", {
        month: "short",
      });

      return {
        month: monthLabel,
        income: sampleValues[index],
        expense: expenseValues[index],
      };
    });
  };

  const sampleData = generateSampleData();

  const chartData = data.length > 0 ? data : sampleData;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Income vs Expenses for the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          Income vs Expenses for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expense)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expense)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="var(--color-income)"
              strokeWidth={2}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="var(--color-expense)"
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
