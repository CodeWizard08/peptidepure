/**
 * Authorize.net server-side charge using Accept.js opaque data.
 * The card number never touches our servers — PCI compliant.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ApiContracts = require('authorizenet').APIContracts;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ApiControllers = require('authorizenet').APIControllers;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SDKConstants = require('authorizenet').Constants;

interface BillTo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ChargeParams {
  opaqueDataDescriptor: string;
  opaqueDataValue: string;
  amount: number;
  billTo: BillTo;
  orderDescription: string;
  customerEmail: string;
}

interface ChargeResult {
  success: boolean;
  transactionId?: string;
  message: string;
}

export async function chargeCard(params: ChargeParams): Promise<ChargeResult> {
  return new Promise((resolve) => {
    const {
      opaqueDataDescriptor,
      opaqueDataValue,
      amount,
      billTo,
      orderDescription,
      customerEmail,
    } = params;

    // Credentials
    const merchantAuthenticationType =
      new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.AUTHORIZENET_API_LOGIN_ID!);
    merchantAuthenticationType.setTransactionKey(
      process.env.AUTHORIZENET_TRANSACTION_KEY!
    );

    // Opaque payment data from Accept.js
    const opaqueData = new ApiContracts.OpaqueDataType();
    opaqueData.setDataDescriptor(opaqueDataDescriptor);
    opaqueData.setDataValue(opaqueDataValue);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    // Bill-to address
    const billToAddress = new ApiContracts.CustomerAddressType();
    billToAddress.setFirstName(billTo.firstName);
    billToAddress.setLastName(billTo.lastName);
    billToAddress.setAddress(billTo.address);
    billToAddress.setCity(billTo.city);
    billToAddress.setState(billTo.state);
    billToAddress.setZip(billTo.zip);
    billToAddress.setCountry(billTo.country);

    // Order
    const orderDetails = new ApiContracts.OrderType();
    orderDetails.setDescription(orderDescription.slice(0, 255));

    // Customer
    const customerData = new ApiContracts.CustomerDataType();
    customerData.setEmail(customerEmail);

    // Transaction
    const transactionRequest =
      new ApiContracts.TransactionRequestType();
    transactionRequest.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequest.setPayment(paymentType);
    transactionRequest.setAmount(amount.toFixed(2));
    transactionRequest.setBillTo(billToAddress);
    transactionRequest.setOrder(orderDetails);
    transactionRequest.setCustomer(customerData);

    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequest);

    const environment =
      process.env.AUTHORIZENET_ENVIRONMENT === 'production'
        ? SDKConstants.endpoint.production
        : SDKConstants.endpoint.sandbox;

    const ctrl = new ApiControllers.CreateTransactionController(
      createRequest.getJSON()
    );
    ctrl.setEnvironment(environment);

    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      const response = new ApiContracts.CreateTransactionResponse(apiResponse);

      if (!response) {
        return resolve({ success: false, message: 'No response from gateway' });
      }

      if (
        response.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        const txResponse = response.getTransactionResponse();
        if (
          txResponse &&
          txResponse.getMessages() &&
          !txResponse.getErrors()
        ) {
          return resolve({
            success: true,
            transactionId: txResponse.getTransId(),
            message: 'Approved',
          });
        }
        // Transaction-level error
        const err = txResponse?.getErrors()?.getError()?.[0];
        return resolve({
          success: false,
          message: err
            ? `${err.getErrorCode()}: ${err.getErrorText()}`
            : 'Transaction declined',
        });
      }

      // API-level error
      const msg = response.getMessages().getMessage()?.[0];
      return resolve({
        success: false,
        message: msg ? `${msg.getCode()}: ${msg.getText()}` : 'Gateway error',
      });
    });
  });
}
