import Redis from "ioredis";

export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: "localhost",
      port: 6379,
    });
  }

  /** decision 저장 */
  async saveDecision(chatId: number, decision: string): Promise<void> {
    await this.client.set(this.decisionKey(chatId), decision, "EX", 60 * 10);
  }

  async getDecision(chatId: number): Promise<string | null> {
    return this.client.get(this.decisionKey(chatId));
  }

  /** 스트리밍 메시지 누적 */
  async appendMessage(chatId: number, chunk: string): Promise<void> {
    await this.client.append(this.messageKey(chatId), chunk);
  }

  async getFullMessage(chatId: number): Promise<string | null> {
    return this.client.get(this.messageKey(chatId));
  }

  async clearChat(chatId: number): Promise<void> {
    await this.client.del(this.decisionKey(chatId), this.messageKey(chatId));
  }

  private decisionKey(chatId: number) {
    return `chat:${chatId}:decision`;
  }

  private messageKey(chatId: number) {
    return `chat:${chatId}:message`;
  }
}
