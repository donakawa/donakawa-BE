import {
  GlideClient,
  GlideClusterClient,
  GlideClusterClientConfiguration,
} from "@valkey/valkey-glide";
import { EventEmitterClient } from "../wishlist/infra/event-emitter.client";
import { CrawlStatusUpdatedPayload } from "../interface/event-payload.interface";
import { EventType } from "../enum/event-type.enum";
export class ValkeyClient {
  valkeyPub!: GlideClusterClient | GlideClient;
  valkeySub!: GlideClusterClient | GlideClient;
  constructor() {}
  static async init(eventEmitterClient: EventEmitterClient) {
    const client = new this();
    const isProd = process.env.NODE_ENV === "production";
    client.valkeyPub = await (
      isProd ? GlideClusterClient : GlideClient
    ).createClient({
      addresses: [
        {
          host: isProd
            ? process.env.VALKEY_URL_PRODUCTION!
            : process.env.VALKEY_URL_DEV!,
          port: isProd
            ? Number(process.env.VALKEY_PORT_PRODUCTION!)
            : Number(process.env.VALKEY_PORT_DEV!),
        },
      ],
      useTLS: isProd,
    });
    client.valkeySub = await (
      isProd ? GlideClusterClient : GlideClient
    ).createClient({
      addresses: [
        {
          host: isProd
            ? process.env.VALKEY_URL_PRODUCTION!
            : process.env.VALKEY_URL_DEV!,
          port: isProd
            ? Number(process.env.VALKEY_PORT_PRODUCTION!)
            : Number(process.env.VALKEY_PORT_DEV!),
        },
      ],
      pubsubSubscriptions: {
        channelsAndPatterns: {
          [GlideClusterClientConfiguration.PubSubChannelModes.Pattern]: new Set(
            ["__keyevent@0__:set"],
          ),
        },
        callback: (message) => {
          const path = message.message.toString();
          const crawlJobStatusKeyRegex = /^status:crawl:(.+):status$/;
          if (!path.match(crawlJobStatusKeyRegex)) return;
          const jobId = path.split(":").at(-2);
          if (!jobId) return;
          const payload: CrawlStatusUpdatedPayload = {
            jobId,
            occuredAt: new Date(),
          };
          eventEmitterClient.emit<CrawlStatusUpdatedPayload>(
            EventType.CRAWL_STATUS_UPDATED,
            payload,
          );
        },
      },
      useTLS: isProd,
    });
    await client.valkeyPub.configSet({ "notify-keyspace-events": "KEA" });
    return client;
  }
}
