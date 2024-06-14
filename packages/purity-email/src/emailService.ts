import sgMailService from '@sendgrid/mail';
import Mailjet from 'node-mailjet';
import { Order } from '@purity/core/orders/types';
import { InventoryItemEntity } from '@purity/core/inventoryItems';

const appAdminBaseUrl = process.env.APP_ADMIN_BASE_URL;
const environment = String(process.env.WEBINY_ENV);

let sgOptions: SgOptions = null;
let isSgMailServiceInitialized = false;

interface SgOptions {
  apiKey: string;
  sendEmailFrom: string;
  templates: {
    orderConfirmation: string;
    orderCancellation: string;
    orderRejection: string;
  };
}

const getSgOptions = (): SgOptions => {
  if (!sgOptions) {
    sgOptions = {
      apiKey: process.env.SENDGRID_API_KEY || '',
      sendEmailFrom: process.env.SENDGRID_MAIL_SENDER || 'noreply@puritycosmetics.com',
      templates: {
        orderConfirmation: process.env.SENDGRID_TEMPLATE_ORDER_CONFIRMATION,
        orderCancellation: process.env.SENDGRID_TEMPLATE_ORDER_CANCELLATION,
        orderRejection: process.env.SENDGRID_TEMPLATE_ORDER_REJECTION
      }
    };
  }

  return sgOptions;
};

export enum EmailType {
  OrderConfirmation,
  OrderCancellation,

  OrderRejection
}

export interface SendEmailOptionsData {
  order: Order;
  items: Map<string, InventoryItemEntity>;
}

export interface SendEmailOptions {
  type: EmailType;
  to: string | string[];
  data: SendEmailOptionsData;
}

const getSgTemplateId = (type: EmailType, sgOptions: SgOptions) => {
  switch (type) {
    case EmailType.OrderConfirmation:
      return sgOptions.templates.orderConfirmation;
    case EmailType.OrderCancellation:
      return sgOptions.templates.orderCancellation;
    case EmailType.OrderRejection:
      return sgOptions.templates.orderRejection;
  }
};

const getSgbTemplateData = (type: EmailType, { order, items }: SendEmailOptionsData) => {
  switch (type) {
    case EmailType.OrderConfirmation:
      return {
        is_test: environment !== 'prod',
        order_number: order.metadata?.buyerOrderId ?? order.shipmentId,
        order_admin_url: `${appAdminBaseUrl}/orders?id=${order.id}`,
        line_items: order.lineItems.map(item => ({
          title: `${item.merchantSku}` + (items.get(item.merchantSku)?.shopifyVariant?.product?.title ?? ''),
          sku: item.merchantSku,
          quantity: item.numberOfUnits
        }))
      };
    case EmailType.OrderCancellation:
      return {
        is_test: environment !== 'prod',
        order_number: order.metadata?.buyerOrderId ?? order.shipmentId,
        order_admin_url: `${appAdminBaseUrl}/orders?id=${order.id}`
      };
    case EmailType.OrderRejection:
      return {
        is_test: environment !== 'prod',
        order_number: order.metadata?.buyerOrderId ?? order.shipmentId,
        order_admin_url: `${appAdminBaseUrl}/orders?id=${order.id}`
      };
  }
};

const getEmailData = (
  type: EmailType,
  { order, items }: SendEmailOptionsData
): { templateId: number; variables: any } => {
  switch (type) {
    case EmailType.OrderConfirmation:
      return {
        templateId: Number(process.env.MAILJET_TEMPLATE_ORDER_CONFIRMATION || 0),
        variables: {
          order_number: order.metadata?.buyerOrderId ?? order.shipmentId,
          order_admin_url: `${appAdminBaseUrl}/orders?id=${order.id}`,
          total_line_items: order.lineItems.length,
          line_items: order.lineItems.map(item => ({
            title: `${item.merchantSku}` + (items.get(item.merchantSku)?.shopifyVariant?.product?.title ?? ''),
            sku: item.merchantSku,
            quantity: item.numberOfUnits
          }))
        }
      };
    case EmailType.OrderCancellation:
      return {
        templateId: Number(process.env.MAILJET_TEMPLATE_ORDER_CANCELLATION || 0),
        variables: {
          is_test: environment !== 'prod',
          order_number: order.metadata?.buyerOrderId ?? order.shipmentId,
          order_admin_url: `${appAdminBaseUrl}/orders?id=${order.id}`
        }
      };
    case EmailType.OrderRejection:
      return {
        templateId: Number(process.env.MAILJET_TEMPLATE_ORDER_REJECTION || 0),
        variables: {
          is_test: environment !== 'prod',
          order_number: order.metadata?.buyerOrderId ?? order.shipmentId,
          order_admin_url: `${appAdminBaseUrl}/orders?id=${order.id}`
        }
      };
  }
};

const sendEmailWithMailjet = async (options: SendEmailOptions): Promise<object> => {
  const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_APIKEY_PUBLIC || '',
    apiSecret: process.env.MAILJET_APIKEY_PRIVATE || ''
  });

  const emailData = getEmailData(options.type, options.data);

  const response = await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_MAIL_SENDER || 'noreply@puritycosmetics.com',
          Name: 'Purity Cosmetics'
        },
        To: Array.isArray(options.to)
          ? options.to.map(to => ({
              Email: to
            }))
          : [
              {
                Email: options.to
              }
            ],
        TemplateID: emailData.templateId,
        TemplateLanguage: true,
        TemplateErrorReporting: {
          Email: 'giang@puritycosmetics.com',
          Name: 'Error Email'
        },
        Variables: emailData.variables
      }
    ]
  });

  return response.response.data as object;
};

export const sendEmail = async (options: SendEmailOptions): Promise<object> => {
  return await sendEmailWithMailjet(options);
};
