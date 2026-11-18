import { apiRequest } from "../../../lib/api-client";
import type { DashboardSummaryResponse } from "../types/dashboard";

export async function getDashboardSummary() {
  try {
    const response = await apiRequest<DashboardSummaryResponse>(
      "/api/v1/dashboard/summary"
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    throw error;
  }
}