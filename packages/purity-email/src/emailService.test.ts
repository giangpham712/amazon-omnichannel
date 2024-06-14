import { EmailType, sendEmail } from './emailService';

describe('emailService', () => {
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache

    process.env.SENDGRID_API_KEY = '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';
    process.env.SENDGRID_MAIL_SENDER = 'noreply@puritycosmetics.com';
    process.env.SENDGRID_TEMPLATE_ORDER_CONFIRMATION = '50bacd5c-10d3-4943-94e2-383b547a4bfa';
    process.env.SENDGRID_TEMPLATE_ORDER_CANCELLATION = 'd-bda7e29d1d3840449cf1944ea128a61c';
  });
  //
  // test('should send order confirmation email properly', async () => {
  //     const result = await sendEmail({
  //         type: EmailType.OrderConfirmation,
  //         to: 'vulh913@gmail.com',
  //         data: {
  //             order: {
  //                 "customer_name": "Vu Lam",
  //                 "order_number": "PS52020",
  //                 "order_admin_url": "https://100-pure.myshopify.com/admin/orders/4512367280206",
  //                 "order_total": 1000,
  //                 "total_line_items": 10,
  //                 "shipping_total": 5,
  //                 "packed_at": "2020-10-09 16:13:55.000",
  //                 "line_items": [
  //                     { "title": "product 1", "sku": "SKU1", "quantity": 1 },
  //                     { "title": "product 2", "sku": "SKU2", "quantity": 1 },
  //                     { "title": "product 3", "sku": "SKU3", "quantity": 1 }
  //                 ]
  //             },
  //
  //         }
  //     });
  //
  //     console.log(result);
  //
  //     expect(result).not.toBeNaN();
  // });
});
