import { NextRequest, NextResponse } from "next/server";
import { sendPaymentReminder } from "@/lib/uisp/reminders";
import { validateCronTriggers } from "@/lib/validateCronTriggers";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  // Validate the cron trigger token
  const validationResponse = validateCronTriggers(request);
  if (validationResponse) {
    return validationResponse;
  }
  try {
    logger.info(`Now sending final payment reminder`)
    await sendPaymentReminder();
    logger.info('[CRON-REMINDERS] Payment reminder completed');

    return NextResponse.json({
      message: "Cron job triggered successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[CRON-REMINDERS] Error executing reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}