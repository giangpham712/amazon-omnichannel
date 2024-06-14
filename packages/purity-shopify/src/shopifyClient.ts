import Shopify from 'shopify-api-node';

export interface InventoryResponse {
  sku: string;
  variant: {
    id: number;
    title: string;
  };
  product: {
    id: number;
    title: string;
    featuredImage: string;
  };
  locationId: string;
  quantityAvailable: number;
  productInfo: ProductInfo;
}

export interface ProductInfo {
  netWeight: string;
  shippingWeightOz: number;
  shippingWeightG: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

interface CreateOrderLineItem {
  variantId: number;
  quantity: number;
  price: number;
  totalDiscount: number;
}

interface CreateOrderOptions {
  locationId: string;
  lineItems: CreateOrderLineItem[];
  totalTax: number;
  totalDiscount: number;
  totalPrice: number;
}

export interface FulfillOrderOptions {
  orderId: number;
}

export const createShopifyClient = (config: Shopify.IPublicShopifyConfig | Shopify.IPrivateShopifyConfig) => {
  const shopify = new Shopify(config);
  const selectedMetafieldKeys = [
    'net_weight',
    'shipping_weight_oz',
    'shipping_weight_g',
    'length_cm',
    'width_cm',
    'height_cm'
  ];

  return {
    async getInventoryInfo({ sku, locationId }: { sku: string; locationId: string }): Promise<InventoryResponse> {
      const query = `
        query ProductAndInventory($query: String, $locationId: ID!) {
          productVariants(first: 20, query: $query) {
            edges {
              cursor
              node {
                product {
                  id
                  title
                  featuredImage {
                    src
                  }
                }
                id
                sku
                title
                price
                inventoryItem {
                  id
                  inventoryLevel(locationId: $locationId) {
                    id
                    available
                  }
                }
                metafields(first: 30, namespace: "purity-toolbox") {
                  edges {
                    node {
                      id
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const queryResponse = await shopify.graphql(query, {
        query: `sku:${sku}`,
        locationId: `gid://shopify/Location/${locationId}`
      });

      const node = queryResponse?.productVariants?.edges?.find(edge => edge.node?.sku == sku)?.node;
      const { id, title, product, inventoryItem, metafields } = node ?? {};

      const variantId = id.substring('gid://shopify/ProductVariant/'.length);
      const productId = product?.id?.substring('gid://shopify/Product/'.length);
      const productTitle = product?.title;
      const featuredImage = product?.featuredImage?.src;

      const selectedMetaFields = (metafields?.edges ?? [])
        .map(m => m?.node)
        .filter(node => node?.key && selectedMetafieldKeys.indexOf(node.key) >= 0);

      const selectedMetafieldsByKey = new Map<string, any>(selectedMetaFields.map(field => [field.key, field]));
      const productInfo: ProductInfo = {
        netWeight: selectedMetafieldsByKey.get('net_weight')?.value,
        shippingWeightG: parseFloat(selectedMetafieldsByKey.get('shipping_weight_g')?.value) || 0,
        shippingWeightOz: parseFloat(selectedMetafieldsByKey.get('shipping_weight_oz')?.value) || 0,
        lengthCm: parseFloat(selectedMetafieldsByKey.get('length_cm')?.value) || 0,
        widthCm: parseFloat(selectedMetafieldsByKey.get('width_cm')?.value) || 0,
        heightCm: parseFloat(selectedMetafieldsByKey.get('height_cm')?.value) || 0
      };

      const quantityAvailable = inventoryItem?.inventoryLevel?.available ?? 0;

      return {
        sku,
        variant: {
          id: variantId,
          title
        },
        product: {
          id: productId,
          title: productTitle,
          featuredImage
        },
        locationId,
        quantityAvailable,
        productInfo
      };
    },

    async createOrder({
      locationId,
      lineItems,
      totalTax,
      totalDiscount,
      totalPrice
    }: CreateOrderOptions): Promise<Shopify.IOrder> {
      const createOrderPrams = {
        line_items: lineItems.map(line => ({
          variant_id: line.variantId,
          quantity: line.quantity,
          price: line.price,
          // total_discount: line.totalDiscount,
          taxable: true
        })),
        total_discounts: totalDiscount,
        transactions: [
          {
            gateway: 'manual',
            amount: totalPrice,
            kind: 'sale',
            status: 'success'
          }
        ],
        total_tax: totalTax,
        tax_lines: totalTax
          ? [
              {
                title: 'sales tax',
                price: totalTax
              }
            ]
          : undefined,
        fulfillment_status: 'fulfilled',
        tags: ['omnichannel'],
        note: '',
        location_id: locationId
      };

      console.log(`Going to create shopify order`);
      console.log(createOrderPrams);

      const createdOrder = await shopify.order.create(createOrderPrams);

      console.log(createdOrder);

      return createdOrder;
    },

    async createFulfillment({ orderId }: FulfillOrderOptions): Promise<Shopify.IFulfillment> {
      const fulfillment = await shopify.fulfillment.create(orderId, {
        notify_customer: false
      });
      return fulfillment;
    }
  };
};
