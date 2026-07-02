# x-growth-mcp

Custom **MCP (Model Context Protocol) server** for X (Twitter) growth automation.

Published on npm: [`@mj4384963/x-growth-mcp`](https://www.npmjs.com/package/@mj4384963/x-growth-mcp)

## 7 Tools

| Tool | What it does |
|------|-------------|
| `post_tweet` | Post a tweet |
| `get_my_tweets` | Fetch recent tweets with metrics |
| `search_tweets` | Search tweets on any topic |
| `reply_to_tweet` | Reply to a tweet |
| `like_tweet` | Like a tweet |
| `follow_user` | Follow a user |
| `get_my_profile` | Profile stats (followers/following/tweets) |

## Setup

```bash
claude mcp add x-growth -s user   -e API_KEY=your_consumer_key   -e API_SECRET=your_consumer_secret   -e ACCESS_TOKEN=your_access_token   -e ACCESS_TOKEN_SECRET=your_access_token_secret   -- npx -y @mj4384963/x-growth-mcp@latest
```

Get credentials from the [X Developer Console](https://console.x.com) (OAuth 1.0a, Read+Write permissions).

## Stack

- Node.js (ES modules)
- `@modelcontextprotocol/sdk` — MCP server framework
- `twitter-api-v2` — X API client
- stdio transport — works with Claude Code, Claude Desktop, any MCP client

## Note

X API is pay-per-use — most endpoints need credits in your developer account.

---

Built by [Muhammad Yaseen](https://github.com/my5757980) · [@MuhammadYa5968](https://x.com/MuhammadYa5968)
