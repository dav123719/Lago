// ===================================
// Email Index
// ===================================

export {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderStatusUpdateEmail,
} from './send'

export type { EmailData } from './send'
