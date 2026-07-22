import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodType, source: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      throw new ApiError(
        400,
        "Validation failed",
        result.error.issues.map((issue) => issue.message)
      );
    }

    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      req[source] = result.data;
    }

    next();
  };