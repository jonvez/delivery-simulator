import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateOrder } from '@/hooks/useCreateOrder';
import type { CreateOrderInput } from '@/types/order';

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  orderDetails?: string;
}

export function OrderForm() {
  const { createOrder, loading, error, success, resetState } = useCreateOrder();
  const [formData, setFormData] = useState<CreateOrderInput>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    orderDetails: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Customer name validation
    if (!formData.customerName.trim()) {
      errors.customerName = 'Customer name is required';
    } else if (formData.customerName.length > 255) {
      errors.customerName = 'Customer name must be less than 255 characters';
    }

    // Customer phone validation
    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Customer phone is required';
    } else if (formData.customerPhone.length > 50) {
      errors.customerPhone = 'Customer phone must be less than 50 characters';
    }

    // Delivery address validation
    if (!formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required';
    } else if (formData.deliveryAddress.length > 500) {
      errors.deliveryAddress = 'Delivery address must be less than 500 characters';
    }

    // Order details validation (optional but has max length)
    if (formData.orderDetails && formData.orderDetails.length > 1000) {
      errors.orderDetails = 'Order details must be less than 1000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetState();

    if (!validateForm()) {
      return;
    }

    const orderData: CreateOrderInput = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deliveryAddress: formData.deliveryAddress,
    };

    // Only include orderDetails if it's not empty
    if (formData.orderDetails?.trim()) {
      orderData.orderDetails = formData.orderDetails;
    }

    const result = await createOrder(orderData);

    if (result) {
      // Reset form on success
      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        orderDetails: '',
      });
      setFormErrors({});
    }
  };

  const handleInputChange = (
    field: keyof CreateOrderInput,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>
          Enter the details for a new delivery order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm font-medium">
                Order created successfully!
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Enter customer name"
              aria-invalid={!!formErrors.customerName}
              aria-describedby={formErrors.customerName ? 'customerName-error' : undefined}
            />
            {formErrors.customerName && (
              <p id="customerName-error" className="text-sm text-red-600">
                {formErrors.customerName}
              </p>
            )}
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone">
              Customer Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              placeholder="Enter phone number"
              aria-invalid={!!formErrors.customerPhone}
              aria-describedby={formErrors.customerPhone ? 'customerPhone-error' : undefined}
            />
            {formErrors.customerPhone && (
              <p id="customerPhone-error" className="text-sm text-red-600">
                {formErrors.customerPhone}
              </p>
            )}
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">
              Delivery Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
              placeholder="Enter delivery address"
              rows={3}
              aria-invalid={!!formErrors.deliveryAddress}
              aria-describedby={formErrors.deliveryAddress ? 'deliveryAddress-error' : undefined}
            />
            {formErrors.deliveryAddress && (
              <p id="deliveryAddress-error" className="text-sm text-red-600">
                {formErrors.deliveryAddress}
              </p>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-2">
            <Label htmlFor="orderDetails">Order Details (Optional)</Label>
            <Textarea
              id="orderDetails"
              value={formData.orderDetails}
              onChange={(e) => handleInputChange('orderDetails', e.target.value)}
              placeholder="Enter any additional details about the order"
              rows={4}
              aria-invalid={!!formErrors.orderDetails}
              aria-describedby={formErrors.orderDetails ? 'orderDetails-error' : undefined}
            />
            {formErrors.orderDetails && (
              <p id="orderDetails-error" className="text-sm text-red-600">
                {formErrors.orderDetails}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
