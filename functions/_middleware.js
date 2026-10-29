const CRAWLERS = /chatgpt-user|oai-searchbot|gptbot|perplexity-user|perplexitybot|claude-user|claude-searchbot|claudebot|bingbot|googlebot|applebot|duckduckbot|duckassistbot|yandexbot|meta-externalagent|bytespider/i;
const ASSET = /\.(?!(?:html?|txt|xml|md)$)[a-z0-9]{1,8}$/i;
const DEFAULT_SITE = "nAP4XhnA";

export const onRequest = async (context) => {
  const response = await context.next();
  const request = context.request;
  const ua = request.headers.get("user-agent") || "";
  const path = new URL(request.url).pathname;
  const token = context.env.PVUV_INGEST_TOKEN;
  const site = context.env.PVUV_SITE || DEFAULT_SITE;

  if (
    (request.method === "GET" || request.method === "HEAD") &&
    token &&
    CRAWLERS.test(ua) &&
    !path.startsWith("/api/") &&
    !path.startsWith("/_") &&
    !ASSET.test(path)
  ) {
    context.waitUntil(
      fetch(`https://api.pvuv.ai/v1/sites/${site}/crawler_hits`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({
          hits: [
            {
              ua,
              path,
              ip: request.headers.get("cf-connecting-ip"),
              status: response.status,
              ts: Date.now(),
            },
          ],
        }),
      }).catch(() => {}),
    );
  }

  return response;
};
