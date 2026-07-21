import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
  <T extends ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );

      throw new ApiError(422, "Validation failed", errors);
    }

    const data = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };

    if (data.body !== undefined) {
      req.body = data.body;
    }
    if (data.query !== undefined) {
      req.query = data.query as Request["query"];
    }
    if (data.params !== undefined) {
      req.params = data.params as Request["params"];
    }

    next();
  };