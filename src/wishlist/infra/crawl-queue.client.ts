import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { CrawlRequestMessage } from "../messages/crawl-request.message";

export class CrawlQueueClient {
  constructor(private readonly sqs: SQSClient) {}
  async enqueueCrawl(payload: CrawlRequestMessage) {
    return this.sqs.send(
      new SendMessageCommand({
        QueueUrl: process.env.CRAWL_SQS_URL!,
        MessageBody: JSON.stringify(payload.toJson()),
      }),
    );
  }
}
