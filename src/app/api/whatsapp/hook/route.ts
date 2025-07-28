import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { addMonths,format,setDate } from 'date-fns';

import { WebhookNotificationBody, Text, InteractiveMessageNotification } from '@/lib/types';
import WhatsappMessager from '@/lib/whatsapp/message.service';
import { fetchClients } from '@/lib/uisp/uisp.service';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WebhookNotificationBody;
    if (!body?.entry) {
      logger.warn('[WHATSAPP-WEBHOOK] No entry in webhook payload');
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const messages = change.value.messages;
        if (!messages) continue;
        for (const message of messages) {`  `
          switch (message.type) {
            case 'text': {
              const textMsg = message as Text;
              logger.info(`[WHATSAPP-WEBHOOK] Text message from ${textMsg.from}: ${textMsg.text.body}`);
              await WhatsappMessager.sendTemplateMessage(textMsg.from, 'payment_reminder',[{type: 'body', parameters: [{type: 'text', text: '200'},{type: 'text', text: '25 July 2025'}]}]);
              await WhatsappMessager.sendFreeFormTextMessage(textMsg.from, 'Hello, thank you for contacting us. Please contact our agents on this number 0781590257');
              const clients = await fetchClients();
              const today = new Date();
const firstOfNextMonth = setDate(addMonths(today, 1), 1);

            const client=  clients.find(client=>client.firstName=='Nothando' && client.lastName=='Masiya')
            if(client){
            await WhatsappMessager.sendTemplateMessage(client?.contacts[0].phone, 'payment_reminder',[{type: 'body', parameters: [{type: 'text', text:`${client?.accountBalance}`},{type: 'text', text: format(firstOfNextMonth,'dd MMMM yyyy')}]}]);}
            logger.info(`[WHATSAPP-WEBHOOK] Found ${clients.length} clients`);    
              break;
            }
            case 'interactive': {
              const interactiveMsg = message as InteractiveMessageNotification;
              const payload = interactiveMsg.interactive;
              if ('button_reply' in payload) {
                logger.info(`[WHATSAPP-WEBHOOK] Button reply from ${interactiveMsg.from}: ${JSON.stringify(payload.button_reply)}`);
              } else if ('list_reply' in payload) {
                logger.info(`[WHATSAPP-WEBHOOK] List reply from ${interactiveMsg.from}: ${JSON.stringify(payload.list_reply)}`);
              } else if ('nfm_reply' in payload) {
                logger.info(`[WHATSAPP-WEBHOOK] NFM reply from ${interactiveMsg.from}: ${JSON.stringify(payload.nfm_reply)}`);
              } else {
                logger.info(`[WHATSAPP-WEBHOOK] Interactive message from ${interactiveMsg.from}: ${JSON.stringify(payload)}`);
              }
              break;
            }
            default: {
              logger.info(`[WHATSAPP-WEBHOOK] Received message of type ${message.type} from ${message.from}`);
            }
          }
        }
      }
    }
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    logger.error('[WHATSAPP-WEBHOOK] Error handling webhook:', err);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
    // The verification token that WhatsApp sends in the URL (replace with your verification token)
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';
  
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
  
    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === verifyToken) {
        // Respond with the challenge token from the request
        return new NextResponse(challenge, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  
    return new NextResponse('Verification endpoint', { status: 200 });
  }