import { builder } from "../../../builder";

builder.mutationFields((t) => ({
  videoBlockCloudflareToMux: t.withAuth({ isInterop: true }).boolean({