// src/context/OrderProvider.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { OrderContext, type AdminOrder, type AdminOrderItem } from './OrderContext';
import { ordersApi, type BackendOrderResponse, type BackendOrderItem } from '../api/orders';

// Extended type helper to safely handle item properties across API schemas
type OrderOrItem = Partial<Omit<BackendOrderItem, 'order_type'>> & {
  id?: number | string;
  order_type?: string;
  prescription_status?: string | null;
};

const mapBackendToAdminOrder = (order: BackendOrderResponse): AdminOrder => {
  const hasItems = Array.isArray(order.items) && order.items.length > 0;
  const firstItem: OrderOrItem = hasItems ? (order.items![0] as OrderOrItem) : order;

  let rxStatus: string = order.prescription_status || firstItem.prescription_status || 'n_a';
  if (!order.prescription_status && !firstItem.prescription_status) {
    const orderType = firstItem.order_type || order.order_type;
    if (orderType === 'upload_prescription') {
      rxStatus = 'Uploaded';
    } else if (orderType === 'manual_prescription') {
      rxStatus = 'Verified';
    } else {
      rxStatus = 'Not Required';
    }
  }

  const shippingParts = order.shipping_address ? order.shipping_address.split(',') : [];
  const customerName = shippingParts[0]?.trim() || 'Customer';

  // Calculate aggregate item count for batch orders
  const totalItemsCount = hasItems
    ? order.items!.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : order.quantity || 1;

  // Map individual batch items array safely using extended type
  const mappedItems: AdminOrderItem[] | undefined = hasItems
    ? order.items!.map((rawItem) => {
        const item = rawItem as OrderOrItem;
        return {
          id: item.id,
          productId: item.product_id,
          productName: item.product_name || `Optical Frame #${item.product_id}`,
          productBrand: item.product_brand || 'Walters Opticians',
          productImageUrl: item.product_image_url || undefined,
          quantity: item.quantity || 1,
          orderType: item.order_type || 'frame_only',
          framePrice: item.frame_price ?? 0,
          lensFee: item.lens_fee ?? 0,
          prescriptionStatus: item.prescription_status || rxStatus,
          prescriptionFileUrl: item.prescription_file_url || undefined,
          rightSph: item.right_sph ?? undefined,
          rightCyl: item.right_cyl ?? undefined,
          rightAxis: item.right_axis ?? undefined,
          leftSph: item.left_sph ?? undefined,
          leftCyl: item.left_cyl ?? undefined,
          leftAxis: item.left_axis ?? undefined,
          pdMm: item.pd_mm ?? undefined,
        };
      })
    : undefined;

  // Clean title for main high-level table view
  const primaryName = firstItem.product_name || `Optical Frame #${firstItem.product_id || order.product_id}`;

  return {
    id: order.reference_id || `ORD-${order.id}`,
    rawId: order.id,
    referenceId: order.reference_id,
    customerName,
    email: 'Verified Customer',
    date: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    itemsCount: totalItemsCount,
    totalGbp: order.total_amount,
    framePrice: firstItem.frame_price ?? order.frame_price ?? order.total_amount,
    lensFee: firstItem.lens_fee ?? order.lens_fee ?? 0,
    examFee: order.exam_fee ?? 0,
    shippingFee: order.shipping_fee ?? 0,
    prescriptionStatus: rxStatus,
    orderStatus: order.status || 'Order Placed',
    orderType: firstItem.order_type || order.order_type || 'frame_only',
    shippingAddress: order.shipping_address,
    country: order.country,
    trackingNumber: order.tracking_number || undefined,
    carrier: order.carrier || undefined,
    shippingLabelUrl: order.shipping_label_url || undefined,

    // Full Batch Items List
    items: mappedItems,

    // Single product fallback metadata
    productId: firstItem.product_id || order.product_id,
    productName: primaryName,
    productBrand: firstItem.product_brand || order.product_brand || 'Walters Opticians',
    productImageUrl: firstItem.product_image_url || order.product_image_url || undefined,

    // Single product fallback prescription parameters
    prescriptionFileUrl: firstItem.prescription_file_url || order.prescription_file_url || undefined,
    rightSph: firstItem.right_sph ?? order.right_sph ?? undefined,
    rightCyl: firstItem.right_cyl ?? order.right_cyl ?? undefined,
    rightAxis: firstItem.right_axis ?? order.right_axis ?? undefined,
    leftSph: firstItem.left_sph ?? order.left_sph ?? undefined,
    leftCyl: firstItem.left_cyl ?? order.left_cyl ?? undefined,
    leftAxis: firstItem.left_axis ?? order.left_axis ?? undefined,
    pdMm: firstItem.pd_mm ?? order.pd_mm ?? undefined,
  };
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const liveOrders = await ordersApi.getAll();
      setOrders(liveOrders.map(mapBackendToAdminOrder));
    } catch (error: unknown) {
      console.error('Failed to load orders from server:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    ordersApi.getAll()
      .then((liveOrders) => {
        if (isMounted) {
          setOrders(liveOrders.map(mapBackendToAdminOrder));
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          console.error('Failed to load orders from server:', error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    await fetchOrders();
  }, [fetchOrders]);

  const resolveNumericId = (orderId: string | number): number | null => {
    if (typeof orderId === 'number') return orderId;

    const matched = orders.find(
      (o) => o.id === orderId || o.referenceId === orderId || String(o.rawId) === orderId
    );
    if (matched && matched.rawId) return matched.rawId;

    const cleanIdStr = orderId.replace('ORD-', '').replace('WALT-', '');
    const numericId = parseInt(cleanIdStr, 10);
    return isNaN(numericId) ? null : numericId;
  };

  const updateOrderStatus = async (orderId: string | number, newStatus: string) => {
    const numericId = resolveNumericId(orderId);
    if (!numericId) return;

    try {
      await ordersApi.updateStatus(numericId, newStatus);
      await fetchOrders();
    } catch (error: unknown) {
      console.error('Failed to update order status:', error);
    }
  };

  const updatePrescriptionStatus = async (orderId: string | number, rxStatus: string) => {
    const numericId = resolveNumericId(orderId);
    if (!numericId) return;

    try {
      await ordersApi.updatePrescriptionStatus(numericId, rxStatus);
      await fetchOrders();
    } catch (error: unknown) {
      console.error('Failed to update prescription status:', error);
    }
  };

  const generateShippingLabel = async (orderId: string | number, carrierName: string = 'Royal Mail') => {
    const numericId = resolveNumericId(orderId);
    if (!numericId) return;

    try {
      await ordersApi.generateShippingLabel(numericId, carrierName);
      await fetchOrders();
    } catch (error: unknown) {
      console.error('Failed to generate shipping label:', error);
    }
  };

  const simulateCarrierScan = async (orderId: string | number, newStatus: string) => {
    const numericId = resolveNumericId(orderId);
    if (!numericId) return;

    try {
      await ordersApi.simulateCarrierScan(numericId, newStatus);
      await fetchOrders();
    } catch (error: unknown) {
      console.error('Failed to simulate carrier status scan:', error);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        refreshOrders,
        updateOrderStatus,
        updatePrescriptionStatus,
        generateShippingLabel,
        simulateCarrierScan,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};