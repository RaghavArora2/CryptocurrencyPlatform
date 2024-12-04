export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  timeVisible?: boolean;
  theme?: 'light' | 'dark';
}