#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

const server = new Server(
  { name: "x-growth-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "post_tweet",
      description: "X pe tweet post karo @MuhammadYa5968 ke account se",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Tweet ka content (max 280 characters)" }
        },
        required: ["text"]
      }
    },
    {
      name: "get_my_tweets",
      description: "Mere recent tweets dekho",
      inputSchema: {
        type: "object",
        properties: {
          count: { type: "number", description: "Kitne tweets dekhne hain (default 10)" }
        }
      }
    },
    {
      name: "search_tweets",
      description: "X pe tweets search karo kisi bhi topic pe",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          count: { type: "number", description: "Kitne results chahiye (default 10)" }
        },
        required: ["query"]
      }
    },
    {
      name: "reply_to_tweet",
      description: "Kisi tweet ka reply karo",
      inputSchema: {
        type: "object",
        properties: {
          tweet_id: { type: "string", description: "Jis tweet pe reply karna hai uska ID" },
          text: { type: "string", description: "Reply ka content" }
        },
        required: ["tweet_id", "text"]
      }
    },
    {
      name: "like_tweet",
      description: "Kisi tweet ko like karo",
      inputSchema: {
        type: "object",
        properties: {
          tweet_id: { type: "string", description: "Like karne wale tweet ka ID" }
        },
        required: ["tweet_id"]
      }
    },
    {
      name: "follow_user",
      description: "Kisi user ko follow karo",
      inputSchema: {
        type: "object",
        properties: {
          username: { type: "string", description: "Follow karne wale user ka username (without @)" }
        },
        required: ["username"]
      }
    },
    {
      name: "get_my_profile",
      description: "Mera X profile aur stats dekho",
      inputSchema: {
        type: "object",
        properties: {}
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  try {
    if (name === "post_tweet") {
      const tweet = await rwClient.v2.tweet(args.text);
      return {
        content: [{ type: "text", text: `✅ Tweet posted! ID: ${tweet.data.id}\nURL: https://x.com/MuhammadYa5968/status/${tweet.data.id}` }]
      };
    }

    if (name === "get_my_tweets") {
      const me = await rwClient.v2.me();
      const count = args.count || 10;
      const tweets = await rwClient.v2.userTimeline(me.data.id, {
        max_results: count,
        "tweet.fields": ["created_at", "public_metrics"]
      });
      const list = tweets.data.data?.map(t =>
        `📝 ${t.text}\n❤️ ${t.public_metrics?.like_count || 0} likes | 🔁 ${t.public_metrics?.retweet_count || 0} retweets\n🕐 ${t.created_at}\n`
      ).join("\n---\n") || "Koi tweet nahi mila";
      return { content: [{ type: "text", text: list }] };
    }

    if (name === "search_tweets") {
      const count = args.count || 10;
      const results = await rwClient.v2.search(args.query, {
        max_results: count,
        "tweet.fields": ["author_id", "created_at", "public_metrics"],
        "user.fields": ["username"]
      });
      const list = results.data.data?.map(t =>
        `📌 ${t.text}\n❤️ ${t.public_metrics?.like_count || 0} | 🔁 ${t.public_metrics?.retweet_count || 0}\nID: ${t.id}\n`
      ).join("\n---\n") || "Koi result nahi mila";
      return { content: [{ type: "text", text: list }] };
    }

    if (name === "reply_to_tweet") {
      const reply = await rwClient.v2.reply(args.text, args.tweet_id);
      return {
        content: [{ type: "text", text: `✅ Reply posted! ID: ${reply.data.id}` }]
      };
    }

    if (name === "like_tweet") {
      const me = await rwClient.v2.me();
      await rwClient.v2.like(me.data.id, args.tweet_id);
      return { content: [{ type: "text", text: `✅ Tweet liked!` }] };
    }

    if (name === "follow_user") {
      const user = await rwClient.v2.userByUsername(args.username);
      if (!user.data) return { content: [{ type: "text", text: `❌ User @${args.username} nahi mila` }] };
      const me = await rwClient.v2.me();
      await rwClient.v2.follow(me.data.id, user.data.id);
      return { content: [{ type: "text", text: `✅ @${args.username} ko follow kar liya!` }] };
    }

    if (name === "get_my_profile") {
      const me = await rwClient.v2.me({
        "user.fields": ["public_metrics", "description", "created_at"]
      });
      const m = me.data;
      return {
        content: [{
          type: "text",
          text: `👤 ${m.name} (@${m.username})\n📝 ${m.description}\n\n📊 Stats:\n👥 Followers: ${m.public_metrics?.followers_count}\n➡️ Following: ${m.public_metrics?.following_count}\n📝 Tweets: ${m.public_metrics?.tweet_count}`
        }]
      };
    }

    return { content: [{ type: "text", text: `❌ Unknown tool: ${name}` }] };

  } catch (err) {
    return { content: [{ type: "text", text: `❌ Error: ${err.message}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
