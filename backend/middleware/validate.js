export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_form";
        if (!errors[key]) errors[key] = issue.message;
      }
      return res.status(400).json({ message: "Validation failed", errors });
    }

    req.validated = { ...(req.validated || {}), [source]: result.data };
    if (source === "body") req.body = result.data;
    next();
  };