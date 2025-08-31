"use client";

import { useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  Calendar as CalendarIcon,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
} from "lucide-react";
import { unparse } from "papaparse";
import jsPDF from "jspdf";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("monthly");
  const [dateFrom, setDateFrom] = useState<Date>(subMonths(new Date(), 6));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  // TRPC queries for real data
  const monthlyReportQuery = api.transaction.getMonthlyReport.useQuery(
    { from: dateFrom, to: dateTo },
    { enabled: !!dateFrom && !!dateTo },
  );

  const categoryBreakdownQuery = api.transaction.getCategoryBreakdown.useQuery(
    { from: dateFrom, to: dateTo, type: "expense" },
    { enabled: !!dateFrom && !!dateTo },
  );

  const financialSummaryQuery = api.transaction.getFinancialSummary.useQuery(
    { from: dateFrom, to: dateTo },
    { enabled: !!dateFrom && !!dateTo },
  );

  const trendDataQuery = api.transaction.getTrendData.useQuery(
    { from: dateFrom, to: dateTo, period: "monthly" },
    { enabled: !!dateFrom && !!dateTo },
  );

  const detailedTransactionsQuery = api.transaction.getTransactions.useQuery(
    { from: dateFrom, to: dateTo, limit: 100, offset: 0 },
    { enabled: !!dateFrom && !!dateTo && reportType === "detailed" },
  );

  const isLoading =
    monthlyReportQuery.isLoading ||
    categoryBreakdownQuery.isLoading ||
    financialSummaryQuery.isLoading ||
    trendDataQuery.isLoading ||
    (reportType === "detailed" && detailedTransactionsQuery.isLoading);

  const downloadCSV = (data: unknown[], filename: string) => {
    try {
      const csv = unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      const margin = 20;
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.text("Financial Report", margin, yPosition);
      yPosition += 20;

      // Date range
      pdf.setFontSize(12);
      pdf.text(
        `Period: ${format(dateFrom, "MMM dd, yyyy")} - ${format(dateTo, "MMM dd, yyyy")}`,
        margin,
        yPosition,
      );
      yPosition += 15;

      // Financial Summary
      if (financialSummaryQuery.data) {
        const summary = financialSummaryQuery.data;
        pdf.setFontSize(16);
        pdf.text("Financial Summary", margin, yPosition);
        yPosition += 15;

        pdf.setFontSize(12);
        pdf.text(
          `Total Income: $${summary.totalIncome.toLocaleString()}`,
          margin,
          yPosition,
        );
        yPosition += 10;
        pdf.text(
          `Total Expenses: $${summary.totalExpenses.toLocaleString()}`,
          margin,
          yPosition,
        );
        yPosition += 10;
        pdf.text(
          `Net Income: $${summary.netIncome.toLocaleString()}`,
          margin,
          yPosition,
        );
        yPosition += 10;
        pdf.text(
          `Total Transactions: ${summary.totalTransactions}`,
          margin,
          yPosition,
        );
        yPosition += 20;
      }

      // Category Breakdown
      if (
        categoryBreakdownQuery.data &&
        categoryBreakdownQuery.data.length > 0
      ) {
        pdf.setFontSize(16);
        pdf.text("Category Breakdown", margin, yPosition);
        yPosition += 15;

        categoryBreakdownQuery.data.slice(0, 10).forEach((category) => {
          pdf.setFontSize(10);
          pdf.text(
            `${category.category}: $${category.amount.toLocaleString()} (${category.percentage}%) - ${category.transactions} transactions`,
            margin,
            yPosition,
          );
          yPosition += 8;
        });
      }

      // Save the PDF
      pdf.save(`financial-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exported successfully!");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const handleExportReport = (format: "csv" | "pdf") => {
    if (format === "csv") {
      switch (reportType) {
        case "monthly":
          if (monthlyReportQuery.data) {
            downloadCSV(monthlyReportQuery.data, "monthly-report");
          }
          break;
        case "category":
          if (categoryBreakdownQuery.data) {
            downloadCSV(categoryBreakdownQuery.data, "category-breakdown");
          }
          break;
        case "detailed":
          if (detailedTransactionsQuery.data?.transactions) {
            downloadCSV(
              detailedTransactionsQuery.data.transactions,
              "detailed-transactions",
            );
          }
          break;
        case "trend":
          if (trendDataQuery.data) {
            downloadCSV(trendDataQuery.data, "trend-analysis");
          }
          break;
      }
    } else {
      void generatePDF();
    }
  };

  const setDateRange = (range: "1m" | "3m" | "6m" | "1y") => {
    const now = new Date();
    const endDate = endOfMonth(now);
    let startDate: Date;

    switch (range) {
      case "1m":
        startDate = startOfMonth(subMonths(now, 1));
        break;
      case "3m":
        startDate = startOfMonth(subMonths(now, 3));
        break;
      case "6m":
        startDate = startOfMonth(subMonths(now, 6));
        break;
      case "1y":
        startDate = startOfMonth(subMonths(now, 12));
        break;
    }

    setDateFrom(startDate);
    setDateTo(endDate);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and download detailed financial reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExportReport("csv")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              Export CSV
            </Button>
            <Button
              onClick={() => handleExportReport("pdf")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              Export PDF
            </Button>
          </div>
        </div>

        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Configure the parameters for your financial report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Summary</SelectItem>
                    <SelectItem value="category">Category Breakdown</SelectItem>
                    <SelectItem value="detailed">
                      Detailed Transactions
                    </SelectItem>
                    <SelectItem value="trend">Trend Analysis</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {dateFrom
                        ? format(dateFrom, "MMM dd, yyyy")
                        : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      required
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {dateTo ? format(dateTo, "MMM dd, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      required
                    />
                  </PopoverContent>
                </Popover>

                <Select
                  onValueChange={(value) =>
                    setDateRange(value as "1m" | "3m" | "6m" | "1y")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quick select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Last 1 Month</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last 1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        {reportType === "monthly" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                Monthly Summary Report
              </CardTitle>
              <CardDescription>
                Overview of your financial activity by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyReportQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : monthlyReportQuery.data &&
                monthlyReportQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total Income</TableHead>
                      <TableHead className="text-right">
                        Total Expenses
                      </TableHead>
                      <TableHead className="text-right">Net Income</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead>Top Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyReportQuery.data.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {report.month}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          ${report.totalIncome.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          ${report.totalExpenses.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            report.netIncome > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {report.netIncome > 0 ? "+" : ""}$
                          {report.netIncome.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {report.transactionCount}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {report.topCategory} ($
                            {report.topCategoryAmount.toLocaleString()})
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <FileText className="mx-auto mb-4 size-12" />
                  <p>No data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {reportType === "category" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Spending breakdown by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryBreakdownQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : categoryBreakdownQuery.data &&
                  categoryBreakdownQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {categoryBreakdownQuery.data.map((category, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {category.category}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {category.percentage}%
                            </span>
                          </div>
                          <div className="bg-muted h-2 w-full rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${category.amount.toLocaleString()}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {category.transactions} transactions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    <BarChart3 className="mx-auto mb-4 size-12" />
                    <p>No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>
                  Key metrics for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {financialSummaryQuery.isLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : financialSummaryQuery.data ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-green-600" />
                        <span className="text-sm">Total Income</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        $
                        {financialSummaryQuery.data.totalIncome.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="size-4 text-red-600" />
                        <span className="text-sm">Total Expenses</span>
                      </div>
                      <span className="text-lg font-bold text-red-600">
                        $
                        {financialSummaryQuery.data.totalExpenses.toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Net Income</span>
                        <span
                          className={`text-xl font-bold ${
                            financialSummaryQuery.data.netIncome >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {financialSummaryQuery.data.netIncome >= 0 ? "+" : ""}
                          $
                          {financialSummaryQuery.data.netIncome.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {financialSummaryQuery.data.totalTransactions}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Total Transactions
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          ${financialSummaryQuery.data.avgTransaction}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Avg. Transaction
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    <TrendingUp className="mx-auto mb-4 size-12" />
                    <p>No financial data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "detailed" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                Detailed Transaction Report
              </CardTitle>
              <CardDescription>
                Complete list of all transactions in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detailedTransactionsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : detailedTransactionsQuery.data?.transactions &&
                detailedTransactionsQuery.data.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedTransactionsQuery.data.transactions.map(
                      (transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.description ?? "No description"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.category ?? "Uncategorized"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "income"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}$
                            {Number(transaction.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <FileText className="mx-auto mb-4 size-12" />
                  <p>No transactions found for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {reportType === "trend" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                Trend Analysis Report
              </CardTitle>
              <CardDescription>
                Financial trends and patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendDataQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </div>
              ) : trendDataQuery.data && trendDataQuery.data.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendDataQuery.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value + "-01");
                            return format(date, "MMM yyyy");
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `$${value.toLocaleString()}`,
                            name === "income"
                              ? "Income"
                              : name === "expenses"
                                ? "Expenses"
                                : "Net",
                          ]}
                          labelFormatter={(label) => {
                            const date = new Date(label + "-01");
                            return format(date, "MMMM yyyy");
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="income"
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="expenses"
                        />
                        <Line
                          type="monotone"
                          dataKey="net"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="net"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Avg Monthly Income
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        $
                        {Math.round(
                          trendDataQuery.data.reduce(
                            (sum, item) => sum + item.income,
                            0,
                          ) / trendDataQuery.data.length,
                        ).toLocaleString()}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="size-4 text-red-600" />
                        <span className="text-sm font-medium">
                          Avg Monthly Expenses
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        $
                        {Math.round(
                          trendDataQuery.data.reduce(
                            (sum, item) => sum + item.expenses,
                            0,
                          ) / trendDataQuery.data.length,
                        ).toLocaleString()}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="size-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Avg Monthly Net
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        $
                        {Math.round(
                          trendDataQuery.data.reduce(
                            (sum, item) => sum + item.net,
                            0,
                          ) / trendDataQuery.data.length,
                        ).toLocaleString()}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <BarChart3 className="mx-auto mb-4 size-12" />
                  <p>No trend data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
