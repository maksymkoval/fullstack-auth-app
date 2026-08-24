import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";

/** TEMPORARY — verifies trust proxy resolves a stable client IP. Remove after. */
@Controller("debug-ip")
export class DebugIpController {
  @Get()
  getIp(@Req() req: Request) {
    return {
      ip: req.ip,
      ips: req.ips,
      xForwardedFor: req.headers["x-forwarded-for"],
    };
  }
}
