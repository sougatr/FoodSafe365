/**
 * Centralized WhatsApp Configuration for FoodSafe365
 * Easily change the support phone number or automated alert number at any time.
 */

// Default support WhatsApp number (India +91). Can be overridden via NEXT_PUBLIC_WHATSAPP_SUPPORT
export const DEFAULT_WHATSAPP_SUPPORT = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT || '918356055834';

/**
 * Returns a standard WhatsApp Click-to-Chat deep link
 * @param phone Optional recipient phone number (defaults to FoodSafe365 support)
 * @param text Optional pre-filled message
 */
export function getWhatsAppChatUrl(phone?: string, text?: string): string {
  const targetPhone = (phone || DEFAULT_WHATSAPP_SUPPORT).replace(/[^0-9]/g, '');
  const cleanPhone = targetPhone.startsWith('91') || targetPhone.length > 10 ? targetPhone : `91${targetPhone}`;
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ''}`;
}

/**
 * Returns a standard WhatsApp Share URL to share text to any contact
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
