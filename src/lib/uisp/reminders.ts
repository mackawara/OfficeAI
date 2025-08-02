import { fetchClients } from "./uisp.service";

import {  addMonths, format, setDate } from "date-fns";
import { CONFIG } from "../config";

import { logger } from "../logger";
import WhatsappMessager from "../whatsapp/message.service";
import { cli } from "winston/lib/winston/config";

const NODE_ENV = CONFIG.NODE_ENV;
const DEV_TEST_RECEIVER_NUMBER = CONFIG.DEV_TEST_RECEIVER_NUMBER;
export async function sendPaymentReminder() {
  logger.info(`[UISP-REMINDERS] Sending payment reminders`);
  try {
    const clients = await fetchClients();
    const today = new Date();
    let clientsIsNeedReminder: string[] = []
    const firstOfNextMonth = setDate(addMonths(today, 1), 1);
    if (NODE_ENV === "development") {
      const client = clients.find(client => client.firstName === "Nothando" && client.lastName === "Masiya");
      if (!client) {
        logger.error(`[UISP-REMINDERS] Client not found`);
        return;
      }
      logger.info(`[UISP-REMINDERS] Sending payment reminder to ${client?.firstName || client.companyContactFirstName} ${client?.lastName ?? client.companyContactLastName}`);
      await WhatsappMessager.sendTemplateMessage(
        DEV_TEST_RECEIVER_NUMBER!,
        "payment_reminder",
        [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: `${client?.firstName || client.companyContactFirstName} ${client?.lastName ?? client.companyContactLastName}`,
              },
              { type: "text", text: `${client?.accountBalance}` },
              {
                type: "text",
                text: format(firstOfNextMonth, "dd MMMM yyyy"),
              },
            ],
          },
        ]
      );
      return;
    }
    clients.forEach(async (client) => {
      if (client.hasOverdueInvoice && client.accountOutstanding > 10) {
        clientsIsNeedReminder.push(`${client.companyName || client.firstName} ${client.lastName}:Balance: ${client.accountBalance}}`);
        //send reminder
        await WhatsappMessager.sendTemplateMessage(
          client?.contacts[0].phone,
          "payment_reminder",
          [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `${client?.firstName || client.companyContactFirstName} ${client?.lastName ?? client.companyContactLastName}`,
                },
                { type: "text", text: `${client?.accountBalance}` },
                {
                  type: "text",
                  text: format(firstOfNextMonth, "dd MMMM yyyy"),
                },
              ],
            },
          ]
        );
      }
    });
[CONFIG.ADMIN_NUMBER,CONFIG.DEV_TEST_RECEIVER_NUMBER].forEach(async (receiver) => {
    if (!receiver) return;
    if (CONFIG.IS_LOCAL_ENVIRONMENT) {
      if(receiver===CONFIG.ADMIN_NUMBER)
        return;
      // In local environment, send to the test receiver number for testing   in prd send to both admin and dev test receiver
      await WhatsappMessager.sendTemplateMessage(
        receiver,
        "reminders_admin",
        [
          {
            type: "body",
            parameters: [
              { type: "text", text: clientsIsNeedReminder.join("\n") },
            
            ],  
          },
        ]
      );
      
    }
   
  }
    );
    await logger.info(`[WHATSAPP-WEBHOOK] Clients that need payment reminders: ${clientsIsNeedReminder.join("\n")}`);
  } catch (error) {
    logger.error(`[WHATSAPP-WEBHOOK] Error sending payment reminder: ${error}`);
  }
}
export async function sendFinalReminder() {
  logger.info(`[UISP-REMINDERS] Sending final reminders`);
  try {
    const clients = await fetchClients();
    const today = new Date();
    const tenthOfthisMonth=setDate(today,10)
    
    if (NODE_ENV === "development") {
      const client = clients.find(client => client.firstName === "Nothando" && client.lastName === "Masiya");
      if (!client) {
        logger.error(`[UISP-REMINDERS] Client not found`);
        return;
      }
      logger.info(`[UISP-REMINDERS] Sending final reminder to ${client?.firstName || client.companyContactFirstName} ${client?.lastName ?? client.companyContactLastName}`);
      await WhatsappMessager.sendTemplateMessage(
        DEV_TEST_RECEIVER_NUMBER!,
        "final_reminder",
        [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: `${client?.firstName || client.companyContactFirstName} ${client?.lastName ?? client.companyContactLastName}`,
              },
              { type: "text", text: `${Math.abs(client?.accountOutstanding)}` },
              {
                type: "text",
                text: format(tenthOfthisMonth, "dd MMMM yyyy"),
              },
            ],
          },
        ]
      );
      return;
    }
    clients.forEach(async (client) => {
      if (client.hasOverdueInvoice && client.accountOutstanding > 10) {
        //send reminder
        
        await WhatsappMessager.sendTemplateMessage(
          client?.contacts[0].phone,
          "final_reminder",
          [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `${client?.firstName || client.companyContactFirstName} ${client?.lastName ?? client.companyContactLastName}`,
                },
                { type: "text", text: `${Math.abs(client?.accountOutstanding)}` },
                {
                  type: "text",
                  text: format(tenthOfthisMonth, "dd MMMM yyyy"),
                },
              ],
            },
          ]
        );
      }
    });
  } catch (error) {
    logger.error(`[UISP-REMINDERS] Error sending final reminders: ${error}`);
  }
}
