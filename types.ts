export interface CSVRow {
  [key: string]: string | number | undefined;
}

export interface DataStats {
  totalRows: number;
  totalAmount: number;
  topBA: { name: string; value: number } | null;
  monthlyTrend: { month: string; value: number }[];
  categoryBreakdown: { name: string; value: number }[];
  headers: string[];
}

export enum ProcessingState {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface StoryResponse {
  markdown: string;
}