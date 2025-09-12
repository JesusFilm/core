import { LangfuseSpanProcessor, ShouldExportSpan } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

const shouldExportSpan: ShouldExportSpan = (span) => {
  return span.otelSpan.instrumentationScope.name !== "next.js";
};

const usSpanProcessor = new LangfuseSpanProcessor({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
  shouldExportSpan,
});

const spanProcessors = [usSpanProcessor]

export const flush = async () =>
  Promise.all(spanProcessors.map((p) => p.forceFlush()));

const tracerProvider = new NodeTracerProvider({
  spanProcessors,
});

tracerProvider.register();