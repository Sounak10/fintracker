import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const transactionRouter = createTRPCRouter({
  getTransactions: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        type: z.enum(["income", "expense"]).optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause = {
        userId: ctx.session.user.id,
        date: {
          gte: input.from,
          lte: input.to,
        },
        ...(input.type && { type: input.type }),
        ...(input.category && { category: input.category }),
        ...(input.search && {
          OR: [
            {
              description: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              category: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
      };

      const transaction = await ctx.db.transaction.findMany({
        where: whereClause,
        orderBy: { date: "desc" },
        take: input.limit,
        skip: input.offset,
      });

      const totalCount = await ctx.db.transaction.count({ where: whereClause });

      return {
        transactions: transaction,
        totalCount: totalCount,
      };
    }),

  createTransaction: protectedProcedure
    .input(
      z.object({
        type: z.enum(["income", "expense"]),
        category: z.string().optional(),
        amount: z.number().positive(),
        description: z.string().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),
  updateTransaction: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["income", "expense"]).optional(),
        category: z.string().optional(),
        amount: z.number().positive().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...dataToUpdate } = input;
      return await ctx.db.transaction.update({
        where: {
          id: id,
          userId: ctx.session.user.id, // Ensures user can only delete their own transactions
        },
        data: {
          ...dataToUpdate,
        },
      });
    }),
  deleteTransaction: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id, // Ensures user can only delete their own transactions
        },
      });
    }),
  getSummary: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        type: z.enum(["income", "expense"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const summary = await ctx.db.transaction.groupBy({
        by: ["category"],
        where: {
          userId: ctx.session.user.id,
          type: input.type,
          date: {
            gte: input.from,
            lte: input.to,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // The result needs to be mapped to match the previous structure
      return summary.map((item) => ({
        category: item.category,
        total: item._sum.amount,
      }));
    }),

  getCategories: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: input.from,
            lte: input.to,
          },
          category: {
            not: null,
          },
        },
        select: {
          category: true,
        },
        distinct: ["category"],
        orderBy: {
          category: "asc",
        },
      });

      return categories.map((item) => item.category).filter(Boolean);
    }),

  // New endpoints for reports
  getMonthlyReport: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: input.from,
            lte: input.to,
          },
        },
        orderBy: { date: "desc" },
      });

      // Group by month-year
      interface MonthlyData {
        month: string;
        totalIncome: number;
        totalExpenses: number;
        transactionCount: number;
        categories: Map<string, number>;
      }

      const monthlyData = new Map<string, MonthlyData>();

      transactions.forEach((transaction) => {
        const monthKey = transaction.date.toISOString().slice(0, 7); // YYYY-MM format
        const monthName = transaction.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            totalIncome: 0,
            totalExpenses: 0,
            transactionCount: 0,
            categories: new Map<string, number>(),
          });
        }

        const data = monthlyData.get(monthKey)!;
        data.transactionCount++;

        const amount = Number(transaction.amount);
        if (transaction.type === "income") {
          data.totalIncome += amount;
        } else {
          data.totalExpenses += amount;
        }

        // Track category spending
        if (transaction.category && transaction.type === "expense") {
          const currentAmount = data.categories.get(transaction.category) ?? 0;
          data.categories.set(transaction.category, currentAmount + amount);
        }
      });

      // Convert to array and calculate additional metrics
      const result = Array.from(monthlyData.values()).map((data) => {
        let topCategory: string | null = null;
        let topCategoryAmount = 0;

        data.categories.forEach((amount: number, category: string) => {
          if (amount > topCategoryAmount) {
            topCategory = category;
            topCategoryAmount = amount;
          }
        });

        return {
          month: data.month,
          totalIncome: data.totalIncome,
          totalExpenses: data.totalExpenses,
          netIncome: data.totalIncome - data.totalExpenses,
          transactionCount: data.transactionCount,
          topCategory: topCategory ?? "N/A",
          topCategoryAmount: topCategoryAmount,
        };
      });

      return result.sort(
        (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime(),
      );
    }),

  getCategoryBreakdown: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        type: z.enum(["income", "expense"]).default("expense"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categoryData = await ctx.db.transaction.groupBy({
        by: ["category"],
        where: {
          userId: ctx.session.user.id,
          type: input.type,
          date: {
            gte: input.from,
            lte: input.to,
          },
          category: {
            not: null,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });

      const totalAmount = categoryData.reduce(
        (sum, item) => sum + Number(item._sum.amount ?? 0),
        0,
      );

      return categoryData
        .map((item) => ({
          category: item.category ?? "Uncategorized",
          amount: Number(item._sum.amount ?? 0),
          transactions: item._count.id,
          percentage:
            totalAmount > 0
              ? Math.round((Number(item._sum.amount ?? 0) / totalAmount) * 100)
              : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
    }),

  getFinancialSummary: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: input.from,
            lte: input.to,
          },
        },
      });

      const summary = transactions.reduce(
        (acc, transaction) => {
          const amount = Number(transaction.amount);
          if (transaction.type === "income") {
            acc.totalIncome += amount;
          } else {
            acc.totalExpenses += amount;
          }
          acc.totalTransactions++;
          return acc;
        },
        { totalIncome: 0, totalExpenses: 0, totalTransactions: 0 },
      );

      const avgTransaction =
        summary.totalTransactions > 0
          ? (summary.totalIncome + summary.totalExpenses) /
            summary.totalTransactions
          : 0;

      return {
        ...summary,
        netIncome: summary.totalIncome - summary.totalExpenses,
        avgTransaction: Math.round(avgTransaction),
      };
    }),

  getTrendData: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        period: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
          date: {
            gte: input.from,
            lte: input.to,
          },
        },
        orderBy: { date: "asc" },
      });

      interface TrendData {
        period: string;
        income: number;
        expenses: number;
        transactions: number;
      }

      const trendData = new Map<string, TrendData>();

      transactions.forEach((transaction) => {
        let periodKey: string;

        switch (input.period) {
          case "daily":
            periodKey = transaction.date.toISOString().slice(0, 10); // YYYY-MM-DD
            break;
          case "weekly":
            const weekStart = new Date(transaction.date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            periodKey = weekStart.toISOString().slice(0, 10);
            break;
          case "monthly":
          default:
            periodKey = transaction.date.toISOString().slice(0, 7); // YYYY-MM
            break;
        }

        if (!trendData.has(periodKey)) {
          trendData.set(periodKey, {
            period: periodKey,
            income: 0,
            expenses: 0,
            transactions: 0,
          });
        }

        const data = trendData.get(periodKey)!;
        data.transactions++;

        const amount = Number(transaction.amount);
        if (transaction.type === "income") {
          data.income += amount;
        } else {
          data.expenses += amount;
        }
      });

      return Array.from(trendData.values())
        .map((data) => ({
          ...data,
          net: data.income - data.expenses,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }),
});
