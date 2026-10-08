import { Router, type IRouter } from "express";
import {
  GetRouteOptionsQueryParams,
  GetRouteOptionsResponse,
} from "@workspace/api-zod";
import { getLocationRouteOptions } from "../lib/location-planner";

const router: IRouter = Router();

router.get("/locations/route-options", async (req, res): Promise<void> => {
  const query = GetRouteOptionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Enter both a destination and a starting location." });
    return;
  }

  try {
    const options = await getLocationRouteOptions(
      query.data.destination,
      query.data.origin,
    );
    res.json(GetRouteOptionsResponse.parse(options));
  } catch (error) {
    req.log.warn({ error }, "Could not load route options from location providers");
    res.status(502).json({
      error: "Location services are temporarily unavailable. Please try again.",
    });
  }
});

export default router;
