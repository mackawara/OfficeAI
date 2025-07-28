import { NextRequest, NextResponse } from "next/server";
import { logger } from "../../../lib/logger";
import {
  WebhookNotificationBody,
  Text,
  InteractiveMessageNotification
} from "../../../lib/types";
import WhatsappMessager from "@/lib/whatsapp/message.service";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WebhookNotificationBody;
    if (!body?.entry) {
      logger.warn("[WHATSAPP-WEBHOOK] No entry in webhook payload");
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const messages = change.value.messages;
        if (!messages) continue;
        for (const message of messages) {
          switch (message.type) {
            case "text": {
              const textMsg = message as Text;
              await WhatsappMessager.sendFreeFormTextMessage(
                textMsg.from,
                "Hello, thank you for contacting Venta.This number is not currently set up to recieve messages.\n\n Please contact our agents on this number 0781590257"
              );
              logger.info(
                `[WHATSAPP-WEBHOOK] Text message from ${textMsg.from}: ${textMsg.text.body}`
              );
              break;
            }
            case "interactive": {
              const interactiveMsg = message as InteractiveMessageNotification;
              const payload = interactiveMsg.interactive;
              if ("button_reply" in payload) {
                logger.info(
                  `[WHATSAPP-WEBHOOK] Button reply from ${
                    interactiveMsg.from
                  }: ${JSON.stringify(payload.button_reply)}`
                );
              } else if ("list_reply" in payload) {
                logger.info(
                  `[WHATSAPP-WEBHOOK] List reply from ${
                    interactiveMsg.from
                  }: ${JSON.stringify(payload.list_reply)}`
                );
              } else if ("nfm_reply" in payload) {
                logger.info(
                  `[WHATSAPP-WEBHOOK] NFM reply from ${
                    interactiveMsg.from
                  }: ${JSON.stringify(payload.nfm_reply)}`
                );
              } else {
                logger.info(
                  `[WHATSAPP-WEBHOOK] Interactive message from ${
                    interactiveMsg.from
                  }: ${JSON.stringify(payload)}`
                );
              }
              break;
            }
            default: {
              logger.info(
                `[WHATSAPP-WEBHOOK] Received message of type ${message.type} from ${message.from}`
              );
            }
          }
        }
      }
    }
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    logger.error("[WHATSAPP-WEBHOOK] Error handling webhook:", err);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
