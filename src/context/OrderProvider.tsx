import React, { useState, useEffect, useCallback } from 'react';
import { OrderContext, type AdminOrder } from './OrderContext';
import { ordersApi, type BackendOrderResponse } from '../api/orders';

const mapBackendToAdminOrder = (order: BackendOrderResponse): AdminOrder => {
  let rxStatus: string = order.prescription_status || 'n_a';
  if (!order.prescription_status) {
    if (order.order_type === 'upload_prescription') {
      rxStatus = 'Uploaded';
    } else if (order.order_type === 'manual_prescription') {
      rxStatus = 'Verified';
    } else {
      rxStatus = 'Not Required';
    }
  }

  const shippingParts = order.shipping_address ? order.shipping_address.split(',') : [];
  const customerName = shippingParts[0]?.trim() || 'Customer';

  return {
    id: order.reference_id || `ORD-${order.id}`,
    rawId: order.id,
    referenceId: order.reference_id,
    customerName,
    email: 'Verified Customer',
    date: new Date(order.created_at).toISOString().split('T')[0],
    itemsCount: order.quantity || 1,
    totalGbp: order.total_amount,
    framePrice: order.frame_price,
    lensFee: order.lens_fee,
    examFee: order.exam_fee,
    shippingFee: order.shipping_fee,
    prescriptionStatus: rxStatus,
    orderStatus: order.status || 'Order Placed',
    orderType: order.order_type,
    shippingAddress: order.shipping_address,
    country: order.country,
    trackingNumber: order.tracking_number || undefined,
    carrier: order.carrier || undefined,
    shippingLabelUrl: order.shipping_label_url || undefined,

    // Product details mapping
    productName: order.product_name || `Optical Frame #${order.product_id}`,
    productBrand: order.product_brand || 'Walters Opticians',
    productImageUrl: order.product_image_url || undefined,

    // Prescription parameters mapping
    prescriptionFileUrl: order.prescription_file_url || undefined,
    rightSph: order.right_sph ?? undefined,
    rightCyl: order.right_cyl ?? undefined,
    rightAxis: order.right_axis ?? undefined,
    leftSph: order.left_sph ?? undefined,
    leftCyl: order.left_cyl ?? undefined,
    leftAxis: order.left_axis ?? undefined,
    pdMm: order.pd_mm ?? undefined,
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