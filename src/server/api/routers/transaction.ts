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
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause = {
        userId: ctx.session.user.id,
        date: {
          gte: input.from,
          lte: input.to,
        },
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
});

// export const postRouter = createTRPCRouter({
//   hello: publicProcedure
//     .input(z.object({ text: z.string() }))
//     .query(({ input }) => {
//       return {
//         greeting: `Hello ${input.text}`,
//       };
//     }),

//   // create: protectedProcedure
//   //   .input(z.object({ name: z.string().min(1) }))
//   //   .mutation(async ({ ctx, input }) => {
//   //     return ctx.db.post.create({
//   //       data: {
//   //         name: input.name,
//   //         createdBy: { connect: { id: ctx.session.user.id } },
//   //       },
//   //     });
//   //   }),

//   // getLatest: protectedProcedure.query(async ({ ctx }) => {
//   //   const post = await ctx.db.post.findFirst({
//   //     orderBy: { createdAt: "desc" },
//   //     where: { createdBy: { id: ctx.session.user.id } },
//   //   });

//   //   return post ?? null;
//   // }),

//   getSecretMessage: protectedProcedure.query(() => {
//     return "you can now see this secret message!";
//   }),
// });
