export interface ChartDataPoint {
  time: number;
  value: number;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  timeVisible?: boolean;
  theme?: 'light' | 'dark';
}