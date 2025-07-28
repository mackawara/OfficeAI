import { NextRequest, NextResponse } from "next/server";
import { sendFinalReminder } from "@/lib/uisp/reminders";
import { validateCronTriggers } from "@/lib/validateCronTriggers";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    console.log(request)
    // Validate the cron trigger token
    const validationResponse = validateCronTriggers(request);
    if (validationResponse) {
        return validationResponse;
    }

    try {
        logger.info('[CRON-REMINDERS] Starting finalreminder processing');

        logger.info('[CRON-REMINDERS] Executing final reminder');
        await sendFinalReminder();
        logger.info('[CRON-REMINDERS] Final reminder completed');
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