import cron from "node-cron";
import { UpdateCallScore } from "../scripts/scoreCalls.js";

cron.schedule("*/10 * * * *", async () => {
  console.log("Cron started:", new Date());

  try {
    await UpdateCallScore();
  } catch (error) {
    console.error("Cron failed:", error);
  }
});
