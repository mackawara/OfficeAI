import axios from "axios";

import {CONFIG} from '../config'
import {logger} from '../logger'
import UTILS from '../UTILS'
import { Interactive, TemplateComponentsPostBody } from "../types";
const headers = { "Content-Type": "application/json" };
const whatsappApiVersion = "v23.0";
const WHATSAPP_INDIVIDUAL = "individual";
const WHATSAPP_PRODUCT = "whatsapp";
const WHATSAPP_INTERACTIVE = "interactive";
// eslint-disable-next-line max-len
export const messagesEndpointUrl: string = `https://graph.facebook.com/${whatsappApiVersion}/${CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages?access_token=${CONFIG.WHATSAPP_SYSTEM_TOKEN}`;
const TAG = "[WHATSAPP-MESSAGING]";
// for sending templates and promotional material or other business initiated interactions
const sendTemplateMessage = async (
  receivingNumber: string,
  templateName: string,
  components?: TemplateComponentsPostBody[],
) => {
  try {
    const message = await axios({
      method: "POST",
      url: messagesEndpointUrl,
      data: {
        recipient_type: WHATSAPP_INDIVIDUAL,
        messaging_product: WHATSAPP_PRODUCT,
        to: receivingNumber,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: components,
        },
        headers: headers,
      },
    });
    logger.info(
      `${TAG} Template message sending status = ${message.statusText}`,
    );
  } catch (err) {
    if (UTILS.isFacebookAPIError(err)) {
      const { message, fbtrace_id, error_data } = err.response.data.error;
      logger.error(
        `${TAG}error: ${message}, ${error_data?.details} Facebook traceID : ${fbtrace_id}`,
      );
    } else {
      logger.error(err);
    }
  }
};

const sendFreeFormTextMessage = async (
  receivingNumber: string,
  text: string,
) => {
  logger.info(messagesEndpointUrl)
  await axios({
    method: "POST",
    url: messagesEndpointUrl,
    data: {
      recipient_type: WHATSAPP_INDIVIDUAL,
      messaging_product: WHATSAPP_PRODUCT,
      to: receivingNumber,
      type: "text",
      text: { body: text },
      headers: headers,
    },
  }).catch((err) => {
    if (UTILS.isFacebookAPIError(err)){
      logger.error(err.response.data.error.message);
    }
    else{logger.error(err)}
  });
};

const sendInteractive = async (
  receivingNumber: string,
  interactiveObject: Interactive,
) => {
  try {
    const result = await axios({
      method: "POST",
      url: messagesEndpointUrl,
      data: {
        recipient_type: WHATSAPP_INDIVIDUAL,
        messaging_product: WHATSAPP_PRODUCT,
        to: receivingNumber,
        type: WHATSAPP_INTERACTIVE,
        interactive: interactiveObject,
      },
    });
    logger.info(
      `${TAG}: message sent to ${receivingNumber}, status: ${result.statusText}`,
    );
  } catch (err) {
    if (UTILS.isFacebookAPIError(err)) {
      const { message, fbtrace_id, error_data } = err.response.data.error;
      logger.error(
        `${TAG}: ${message}, ${error_data?.details} Facebook traceID : ${fbtrace_id}`,
      );
    }
  }
};/* 
export const sendWelcomeMessage = async (params: WelcomeMessageParams) => {
  const { clientNumber, clientName, bodyText, clientStatus } = params;
  let text: string;
  const customerName = `${clientName ? `${clientName},` : "dear customer"}`;
  switch (clientStatus) {
    case "active":
      // eslint-disable-next-line max-len
      text = `${customerName} your session has been restarted 🔄\nAs before, click on any of the options below to begin.`;
      break;
    case "new":
      // eslint-disable-next-line max-len
      text = `Hi ${customerName} 😀\nI am Shaa, Capri's friendly virtual assistant.\nHow can I assist?\n🛑Please note🛑 If you choose to talk to an agent, there may be some waiting time ⏱.`;
      break;
    case "returning":
      // eslint-disable-next-line max-len
      text = `Welcome back *${customerName}* 😀\nI am Shaa, Capri's friendly virtual assistant.\nHow can I help you today?`;
      break;
    case "restarting":
      text = `Please reselect below`;
      break;
    default:
      text = bodyText;
  }

  const message: InteractiveReplyButtonPost = {
    type: "BUTTON",
    body: {
      text: text ?? bodyText,
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: "sales",
            title: "Sales & Promotions",
          },
        },
        {
          type: "reply",
          reply: {
            id: "technical_support",
            title: "Technical Support",
          },
        },
        {
          type: "reply",
          reply: {
            id: "human_agent",
            title: "Chat with Agent",
          },
        },
      ],
    },
  };
  await sendInteractive(clientNumber, message);
}; */

const sendReadStatus = async (msg_id: string) => {
  let read;
  try {
    read = await axios({
      method: "POST",
      url: messagesEndpointUrl,
      data: {
        messaging_product: "whatsapp",
        message_id: msg_id,
        status: "read",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: CONFIG.WHATSAPP_SYSTEM_TOKEN,
      },
    });
    if (read.data.success) {
      logger.info(`Read receipt sent for message id ${msg_id}`);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    if (UTILS.isFacebookAPIError(err)){
      logger.error(err.response.data.error.message);
    }
    else{logger.error(err)}
  }

  return read;
};
const WhatsappMessager = {
  sendFreeFormTextMessage,
  sendInteractive,
  sendReadStatus,
  sendTemplateMessage,
};
export default WhatsappMessager;
