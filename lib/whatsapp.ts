/**
 * WhatsApp integration utilities
 */

/**
 * Generate a WhatsApp share URL with a pre-filled message
 * @param message - The message to pre-fill
 * @param phoneNumber - Optional phone number (with country code, no +)
 * @param groupId - Optional WhatsApp group ID (from group invite link)
 * @returns WhatsApp web URL or deep link
 */
export function getWhatsAppShareUrl(
  message: string,
  phoneNumber?: string,
  groupId?: string
): string {
  const encodedMessage = encodeURIComponent(message)
  
  if (phoneNumber) {
    // Direct chat with specific number
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  } else if (groupId) {
    // WhatsApp group chat
    return `https://chat.whatsapp.com/${groupId}?text=${encodedMessage}`
  } else {
    // Opens WhatsApp with message ready to send (user selects recipient)
    return `https://wa.me/?text=${encodedMessage}`
  }
}

/**
 * Generate a share message for a project
 */
export function getProjectShareMessage(
  projectName: string,
  projectUrl: string,
  summary?: string
): string {
  let message = `📋 ${projectName}\n\n`
  
  if (summary) {
    message += `${summary}\n\n`
  }
  
  message += `View project: ${projectUrl}`
  
  return message
}

/**
 * Open WhatsApp share dialog
 */
export function shareToWhatsApp(
  message: string,
  phoneNumber?: string,
  groupId?: string
): void {
  const url = getWhatsAppShareUrl(message, phoneNumber, groupId)
  window.open(url, "_blank", "noopener,noreferrer")
}

/**
 * Get WhatsApp group ID (if configured)
 * You can set this via environment variable: NEXT_PUBLIC_WHATSAPP_GROUP_ID
 * The group ID can be:
 * - The alphanumeric part from an invite link (e.g., ABC123XYZ from https://chat.whatsapp.com/ABC123XYZ)
 * - A numeric group ID (e.g., 120363422433000915)
 * - A full JID format (e.g., 120363422433000915@g.us) - will extract the numeric part
 */
export function getWhatsAppGroupId(): string | null {
  if (typeof window === "undefined") return null
  // Access the environment variable (available at build time for client-side)
  // In Next.js, NEXT_PUBLIC_ variables are embedded at build time
  const groupId = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_ID
  if (!groupId) return null
  
  // Handle different formats:
  // If it's in JID format (e.g., 120363422433000915@g.us), extract the numeric part
  // If it's already just the ID, use it as-is
  let cleanGroupId = groupId
  if (groupId.includes('@g.us')) {
    cleanGroupId = groupId.split('@')[0]
  }
  
  return cleanGroupId
}

/**
 * Get WhatsApp group URL (if configured)
 */
export function getWhatsAppGroupUrl(): string | null {
  const groupId = getWhatsAppGroupId()
  if (!groupId) return null
  return `https://chat.whatsapp.com/${groupId}`
}

/**
 * Open WhatsApp group chat
 */
export function openWhatsAppGroup(): void {
  const groupUrl = getWhatsAppGroupUrl()
  if (groupUrl) {
    window.open(groupUrl, "_blank", "noopener,noreferrer")
  }
}

