import { prisma } from "../config/database.js";

export async function getDashboardSummary(organizationId: string) {
  try {
    const where = {
      site: {
        customer: {
          organizationId,
        },
      },
    };

    const [statusGroups, totalWorkOrders, recentWorkOrders] =
      await Promise.all([
        prisma.workOrder.groupBy({
          by: ["status"],
          where,
          _count: {
            _all: true,
          },
        }),

        prisma.workOrder.count({
          where,
        }),

        prisma.workOrder.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        }),
      ]);

    const statusCounts = Object.fromEntries(
      statusGroups.map((group) => [
        group.status,
        group._count._all,
      ])
    );

    return {
      totalWorkOrders,
      statusCounts,
      recentWorkOrders,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    throw error;
  }
}