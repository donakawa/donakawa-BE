export interface EventPayload {
  [key: string]: any;
}
export interface CrawlStatusUpdatedPayload extends EventPayload {
  jobId: string;
  occuredAt: Date;
}
