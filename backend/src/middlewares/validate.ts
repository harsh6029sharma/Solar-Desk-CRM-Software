import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

type ValidationSource = "body" | "query" | "params";

export const validate =
  <T extends ZodType>(schema: T, source: ValidationSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      throw new ApiError(422, "Validation failed", errors);
    }

    if (source === "body") {
      req.body = result.data;
    } else if (source === "query") {
      req.query = result.data as Request["query"];
    } else {
      req.params = result.data as Request["params"];
    }

    next();
  };