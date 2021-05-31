/* eslint-disable camelcase, @typescript-eslint/camelcase */

import { createContext, createPayment } from './payment';
import { CkoPaymentType, getCurrentPaymentMethodPayload } from './helpers';
import { sharedRef } from '@vue-storefront/core';

const useCkoPaypal = () => {
  const error = sharedRef(null, 'useCkoPaypal-error');

  const makePayment = async ({
    cartId,
    email,
    secure3d,
    contextDataId = null,
    savePaymentInstrument = false,
    success_url = null,
    failure_url = null,
    reference = null,
    capture = true
  }) => {
    try {
      let context;
      if (!contextDataId) {
        context = await createContext({ reference: cartId, email });
      }

      const payment = await createPayment(
        getCurrentPaymentMethodPayload(CkoPaymentType.PAYPAL, {
          secure3d,
          reference,
          context_id: contextDataId || context.data.id,
          save_payment_instrument: savePaymentInstrument,
          success_url: success_url || `${window.location.origin}/cko/payment-success`,
          failure_url: failure_url || `${window.location.origin}/cko/payment-error`,
          capture
        })
      );

      if (![200, 202].includes(payment.status)) {
        throw new Error(payment.data.error_type);
      }

      error.value = null;
      return payment;
    } catch (e) {
      error.value = e;
      return null;
    }
  };

  return {
    error,
    makePayment
  };
};
export default useCkoPaypal;
