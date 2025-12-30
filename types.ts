
export interface SynonymResponse {
  primary: string;
  topFive: string[];
  others: string[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
