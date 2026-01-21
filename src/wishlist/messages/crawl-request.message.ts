export class CrawlRequestMessage {
  jobId!: string;
  url!: string;
  constructor(jobId: string, url: string) {
    this.jobId = jobId;
    this.url = url;
  }
  public toJson() {
    return {
      jobId: this.jobId,
      url: this.url,
    };
  }
}
