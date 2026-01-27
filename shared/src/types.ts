export interface AnalyzeRequest {
  code: string
}

export interface AnalyzeResponse {
  result: string
}

export interface Misconception {
  name: string
  lines: number[]
  explanation: string
}
