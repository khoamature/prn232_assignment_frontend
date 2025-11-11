import axiosInstance from "./axiosInstance";

export interface ReportParams {
  startDate: string; // ISO format: "2025-11-10T00:00:00"
  endDate: string; // ISO format: "2025-11-11T23:59:59"
}

export interface DailyBreakdown {
  date: string;
  totalArticles: number;
  activeArticles: number;
  inactiveArticles: number;
}

export interface BreakdownItem {
  itemId: number;
  itemName: string;
  totalArticles: number;
  percentage: number;
}

export interface ReportData {
  startDate: string;
  endDate: string;
  totalArticlesCreated: number;
  totalCategories: number;
  inactiveCategoriesCount: number;
  inactiveArticlesCount: number;
  dailyBreakdown: DailyBreakdown[];
  categoryBreakdown: BreakdownItem[];
  authorBreakdown: BreakdownItem[];
}

export interface ReportResponse {
  message: string;
  statusCode: string;
  data: ReportData;
}

const reportService = {
  getReport: async (params: ReportParams) => {
    const response = await axiosInstance.get<ReportResponse>(
      "/NewsArticles/report",
      {
        params: {
          StartDate: params.startDate,
          EndDate: params.endDate,
        },
      }
    );
    return response.data;
  },
};

export default reportService;
