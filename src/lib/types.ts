//INCOMING MESSAGE NOTIFICATION PAYLOAD
import mongoose from "mongoose";
import { HydratedDocument } from "mongoose";
export interface WebhookNotificationBody {
  object: string;
  entry: Entry[];
}

export interface Entry {
  id: string;
  changes: Changes[];
}

export interface Changes {
  value: Value;
  field: string;
}
export interface Value {
  messaging_product: string;
  metadata: Metadata;
  statuses: Status[];
  contacts: Contact[];
  messages?: MessageNotification[];
}
export interface BaseMessageNotificationPayload {
  from: string;
  id: string;
  timestamp: string;
}
export interface InteractiveMessageNotification
  extends BaseMessageNotificationPayload {
  type: "interactive";
  interactive: InteractivePayLoad;
}
export interface OrderMessageNotification
  extends BaseMessageNotificationPayload {
  type: "order";
  order: Order;
}
export interface ReactionMessageNotification
  extends BaseMessageNotificationPayload {
  type: "reaction";
  reaction: {
    message_id: string; //"MESSAGE_ID",
    emoji: string; //"EMOJI name"
  };
}

// Add new interfaces for all WhatsApp message types

export interface ImageMessageNotification extends BaseMessageNotificationPayload {
  type: "image";
  image: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
}

export interface StickerMessageNotification extends BaseMessageNotificationPayload {
  type: "sticker";
  sticker: {
    mime_type: string;
    sha256: string;
    id: string;
  };
}

export interface LocationMessageNotification extends BaseMessageNotificationPayload {
  type: "location";
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

export interface ContactsMessageNotification extends BaseMessageNotificationPayload {
  type: "contacts";
  contacts: Array<{
    addresses?: Array<{
      city?: string;
      country?: string;
      country_code?: string;
      state?: string;
      street?: string;
      type?: string;
      zip?: string;
    }>;
    birthday?: string;
    emails?: Array<{
      email: string;
      type?: string;
    }>;
    name: {
      formatted_name: string;
      first_name?: string;
      last_name?: string;
      middle_name?: string;
      suffix?: string;
      prefix?: string;
    };
    org?: {
      company?: string;
      department?: string;
      title?: string;
    };
    phones?: Array<{
      phone?: string;
      type?: string;
      wa_id?: string;
    }>;
    urls?: Array<{
      url: string;
      type?: string;
    }>;
  }>;
}

export interface SystemMessageNotification extends BaseMessageNotificationPayload {
  type: "system";
  system: {
    body: string;
    new_wa_id?: string;
    type: string;
  };
}

export interface UnknownMessageNotification extends BaseMessageNotificationPayload {
  type: "unknown" | "unsupported";
  errors: Array<{
    code: number;
    details: string;
    title: string;
  }>;
}

// Update the union type:
export type MessageNotification =
  | InteractiveMessageNotification
  | OrderMessageNotification
  | ReactionMessageNotification
  | Text
  | ImageMessageNotification
  | StickerMessageNotification
  | LocationMessageNotification
  | ContactsMessageNotification
  | SystemMessageNotification
  | UnknownMessageNotification;
export interface InteractiveListReplyNotifications {
  list_reply: {
    id: string; //unique identifier of the list message eplied to"list_reply_id",
    title: string;
    description: string; //  "list_reply_description"
  };
  type: "list_reply";
}

export interface InteractiveButtonReplyNotification {
  button_reply: {
    id: string; // unique-button-identifier-here,
    title: string; //button-text,
  };
  type: "button_reply";
}

export interface Pricing {
  billable: boolean;
  pricing_model: string;
  category: string;
}
export interface Contact {
  profile: Profile;
  wa_id: string;
  user_id?: string;
}

export interface Text extends BaseMessageNotificationPayload {
  type: "text";
  text: { body: string };
}

export interface Profile {
  name: string;
}
export interface Order {
  catalog_id: string;
  product_items: OrderItems[];
  text: string;
}
export interface OrderItems {
  product_retailer_id: string;
  quantity: string;
  item_price: string;
  currency: string;
}

export interface InteractiveButtonReplyPayload {
  type: "button_reply";
  button_reply: {
    id: string;
    title: string; //Button label text
  };
}
// For incoming messages payload
export type InteractivePayLoad =
  | InteractiveNfmReplyNotification
  | InteractiveButtonReplyNotification
  | InteractiveListReplyNotifications
  | InteractiveButtonReplyPayload;

export interface InteractiveNfmReplyNotification {
  nfm_reply: Nfm_Reply;
  type: "nfm_reply";
}

export interface Nfm_Reply {
  response_json: string;
  body: "Sent";
  name: "flow";
}
export interface Metadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface Status {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  conversation: Conversation;
  pricing: Pricing;
}

export interface Conversation {
  id: string;
  origin: Origin;
}

export interface Origin {
  type: string;
}

export interface Profile {
  name: string;
}

export interface TextObject {
  type: "text";
  text: string;
}

// OUTGOING MESSAGE OBJECTS
//Media Object used in Interactive message object
//https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#header-object

export type BaseInteractiveObject = {
  body?: { text: string };
  header?: HeaderObject | TextObject; // required for type product list
  footer?: { text: string };
};
export interface ImageHeader {
  type: "image";
  image: { link: string }; // Required when type is "image"
  caption?: string; // Optional, can be used with image type
}

export interface VideoHeader {
  type: "video";
  video: { link: string }; // Required when type is "video"
  caption?: string; // Optional, can be used with video type
}

export interface DocumentHeader {
  type: "document";
  document: { link: string }; // Required when type is "document"
  caption?: string; // Optional, not commonly used with document
}

export interface StickerHeader {
  type: "sticker";
  sticker: { link: string }; // Required when type is "sticker"
}

export interface AudioHeader {
  type: "audio";
  audio: { link: string }; // Required when type is "audio"
}

export interface TextHeader {
  type: "text";
  text: string;
}

export type HeaderObject =
  | ImageHeader
  | VideoHeader
  | DocumentHeader
  | StickerHeader
  | AudioHeader
  | TextHeader;
export interface Actions {
  thumbnail_product_retailer_id?: string;
}
export interface TemplateParamButtonObject {
  type: string;
  payload?: string;
  action?: BaseInteractiveActionObject;
}
export interface TemplateParamButton {
  sub_type?: string;
  index?: string;
  parameters: TemplateParamButtonObject[];
}
export interface TemplateComponentParameter {
  type:
  | "text"
  | "action"
  | "button"
  | "currency"
  | "date_time"
  | "image"
  | "header"
  | "body"
  | "footer";
  sub_type?: string;
  index?: string;
  image?: ImageHeader;
  action?: Actions;
  button?: TemplateParamButton;
  parameters?: TemplateParamButton;
  flow_token?: string;
  payload?: string;
  url?: string;
  text?: string;
}
//fir use when sending free form text messages
export interface FreeFormText {
  type: string;
  text: {
    preview_url?: string;
    body: string;
  };
}

export interface TemplateComponentsPostBody {
  type: "header" | "body" | "footer" | "button";
  sub_type?: string;
  index?: string;
  parameters: TemplateComponentParameter[];
}
export interface ReplyButtonObject {
  type: "reply";
  reply: {
    id: string;
    title: string;
  };
}

export interface ReplyButtonPost {
  buttons: ReplyButtonObject[];
}

// Outgoing messages
export type Interactive =
  | InteractiveCTAReply
  | InteractiveFlow
  | InteractiveList
  | InteractiveProductList
  | InteractiveReplyButtonPost
  | CatalogMessage;

export interface InteractiveList extends BaseInteractiveObject {
  type: "list";
  action: {
    sections: InteractiveActionSection[];
    button: string; // this is the button label that will be shown on the button
  };
}
export interface InteractiveProductList extends BaseInteractiveObject {
  type: "product_list";
  action: {
    sections: InteractiveActionSection[];
    button: string; // this is the button label that will be shown on the button
  };
}

export interface CatalogMessage {
  type: "catalog_message";
  body: {
    text: string;
  };
  action: {
    name: "catalog_message";

    /* Parameters object is optional but  preferable if you want to specify the thumbnail to be used */
    parameters?: {
      thumbnail_product_retailer_id?: string;
    };
  };

  /* Footer object is optional */
  footer?: {
    text: string;
  };
}
export interface InteractiveCTAReply extends BaseInteractiveObject {
  type: "cta_url";
  action: {
    name: "cta_url";
    parameters: {
      display_text: string; //Button labe;
      url: string;
    };
  };
}

interface ProductItem {
  product_retailer_id: string; // Required for Multi-Product Messages. Unique ID for the product in the catalog.
}

interface ActionSectionRows {
  id: string; // Required for List Messages. Unique identifier for the row (max 200 characters).
  title: string; // Required for List Messages. Title of the row (max 24 characters).
  description?: string; // Optional for List Messages. Description of the row (max 72 characters).
}

export interface InteractiveActionSection {
  title: string; // Section title. Required for each section. Max length depends on platform.
  product_items?: ProductItem[]; // Required for Multi-Product Messages. Array of ProductItem objects (1-30 products).
  rows: ActionSectionRows[];
}
export interface InteractiveFlow extends BaseInteractiveObject {
  type: "flow";
  action: {
    name: "flow";
    parameters: {
      mode?: "draft" | "published"; // Optional for Flows Messages. Default: published.
      flow_message_version: "3"; // Required for Flows Messages. Must be "3".
      flow_token: string; // Unique identifier generated by us .
      flow_id: string; //Unique identifier provided by WhatsApp.
      flow_cta: string; // Required for Flows Messages. CTA button text.
      flow_action?: "navigate" | "data_exchange"; // Default: navigate.
      flow_action_payload?: {
        screen: string; // Required if flow_action is navigate. ID of the first screen.
        data?: Record<string, unknown>; // Optional. Input data for the first screen. Must be a non-empty object.
      };
    };
  };
}
export interface InteractiveReplyButtonPost extends BaseInteractiveObject {
  type: "button";
  action: { buttons: ReplyButtonObject[] };
}
export interface FacebookAPIError {
  response: {
    data: {
      error: {
        message: string;
        fbtrace_id?: string;
        error_data?: {
          details?: string;
        };
      };
    };
  };
}
export interface BaseInteractiveActionObject {
  button?: string; // Required for List Messages. Must be a non-empty string and unique within the message.

  buttons?: ReplyButtonObject[];

  sections?: InteractiveActionSection[];

  catalog_id?: string; // Required for Single-Product and Multi-Product Messages. Unique Facebook catalog ID.
  product_retailer_id?: string; // Required for Single-Product and Multi-Product Messages.
  mode?: "draft" | "published"; // Optional for Flows Messages. Default: published.
  flow_message_version?: "3"; // Required for Flows Messages. Must be "3".
  flow_token?: string; // Required for Flows Messages. Unique identifier generated by the business.
  flow_id?: string; // Required for Flows Messages. Unique identifier provided by WhatsApp.
  flow_cta?: string; // Required for Flows Messages. CTA button text.
  flow_action?: "navigate" | "data_exchange"; // Optional for Flows Messages. Default: navigate.
  flow_action_payload?: {
    screen: string; // Required if flow_action is navigate. ID of the first screen.
    data?: Record<string, unknown>; // Optional. Input data for the first screen. Must be a non-empty object.
  };
}

