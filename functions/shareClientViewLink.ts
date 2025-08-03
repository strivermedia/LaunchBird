import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as sgMail from '@sendgrid/mail'
import * as twilio from 'twilio'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()
const auth = admin.auth()

// Configure SendGrid
sgMail.setApiKey(functions.config().sendgrid.api_key)

// Configure Twilio
const twilioClient = twilio(
  functions.config().twilio.account_sid,
  functions.config().twilio.auth_token
)

/**
 * Interface for the function request
 */
interface ShareClientViewLinkRequest {
  clientId: string
  clientEmail?: string
  clientPhone?: string
  accessType: 'code' | 'login'
  sendVia: 'email' | 'sms' | 'both'
  expiresInDays?: number
  userId: string // The user requesting the code generation
}

/**
 * Interface for the function response
 */
interface ShareClientViewLinkResponse {
  success: boolean
  code?: string
  message?: string
  error?: string
}

/**
 * Generate a unique 4-character alphanumeric code
 * @returns Promise<string> - The generated code
 */
async function generateUniqueCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code: string
  let attempts = 0
  const maxAttempts = 100

  do {
    code = ''
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    attempts++

    // Check if code already exists
    const existingCode = await db
      .collection('clientViewCodes')
      .where('code', '==', code)
      .where('isActive', '==', true)
      .limit(1)
      .get()

    if (existingCode.empty) {
      return code
    }
  } while (attempts < maxAttempts)

  throw new Error('Unable to generate unique code after maximum attempts')
}

/**
 * Store the generated code in Firestore
 * @param code - The generated code
 * @param clientId - The client ID
 * @param accessType - The access type
 * @param userId - The user who generated the code
 * @param expiresInDays - Days until expiration
 * @returns Promise<string> - The document ID
 */
async function storeCode(
  code: string,
  clientId: string,
  accessType: 'code' | 'login',
  userId: string,
  expiresInDays: number = 30
): Promise<string> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const codeData = {
    clientId,
    code,
    accessType,
    isActive: true,
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    createdAt: admin.firestore.Timestamp.now(),
    createdBy: userId,
    lastUsedAt: null,
    usageCount: 0,
  }

  const docRef = await db.collection('clientViewCodes').add(codeData)
  return docRef.id
}

/**
 * Send email via SendGrid
 * @param to - Recipient email
 * @param code - The access code
 * @param clientName - The client name
 * @returns Promise<void>
 */
async function sendEmail(to: string, code: string, clientName: string): Promise<void> {
  const msg = {
    to,
    from: functions.config().sendgrid.from_email,
    subject: 'Your LaunchBird Project Access',
    templateId: functions.config().sendgrid.template_id,
    dynamicTemplateData: {
      clientName,
      accessCode: code,
      accessUrl: `https://app.launchbird.io/view/${code}`,
      expiresIn: '30 days',
    },
  }

  await sgMail.send(msg)
}

/**
 * Send SMS via Twilio
 * @param to - Recipient phone number
 * @param code - The access code
 * @param clientName - The client name
 * @returns Promise<void>
 */
async function sendSMS(to: string, code: string, clientName: string): Promise<void> {
  const message = await twilioClient.messages.create({
    body: `Hi ${clientName}, your LaunchBird project access code is: ${code}. Visit: https://app.launchbird.io/view/${code}`,
    from: functions.config().twilio.phone_number,
    to,
  })

  if (message.errorCode) {
    throw new Error(`Twilio error: ${message.errorMessage}`)
  }
}

/**
 * Firebase Function: Share Client View Link
 * Generates unique 4-character codes and sends them via email/SMS
 */
export const shareClientViewLink = functions.https.onCall(
  async (data: ShareClientViewLinkRequest, context): Promise<ShareClientViewLinkResponse> => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new Error('Unauthorized: User must be authenticated')
      }

      const { clientId, clientEmail, clientPhone, accessType, sendVia, expiresInDays, userId } = data

      // Validate required fields
      if (!clientId || !accessType || !sendVia) {
        throw new Error('Missing required fields: clientId, accessType, sendVia')
      }

      // Verify user has permission to access this client
      const userRecord = await auth.getUser(context.auth.uid)
      const userDoc = await db.collection('users').doc(context.auth.uid).get()
      
      if (!userDoc.exists) {
        throw new Error('User profile not found')
      }

      const userData = userDoc.data()
      const userRole = userData?.role || 'member'
      const userOrganizationId = userData?.organizationId

      // Check if user is admin or assigned to this client
      const clientDoc = await db.collection('clients').doc(clientId).get()
      if (!clientDoc.exists) {
        throw new Error('Client not found')
      }

      const clientData = clientDoc.data()
      if (!clientData) {
        throw new Error('Client data not found')
      }

      // Verify organization access
      if (clientData.organizationId !== userOrganizationId) {
        throw new Error('Access denied: Client belongs to different organization')
      }

      // Check if user is admin or assigned manager
      const isAdmin = userRole === 'admin' || userRole === 'owner'
      const isAssignedManager = clientData.assignedManagerId === context.auth.uid

      if (!isAdmin && !isAssignedManager) {
        throw new Error('Access denied: Only admins or assigned managers can generate access codes')
      }

      // Generate unique code
      const code = await generateUniqueCode()

      // Store code in Firestore
      const codeId = await storeCode(code, clientId, accessType, context.auth.uid, expiresInDays)

      // Send via requested method
      const clientName = clientData.name || 'Client'
      const promises: Promise<void>[] = []

      if (sendVia === 'email' || sendVia === 'both') {
        if (!clientEmail) {
          throw new Error('Email required for email delivery')
        }
        promises.push(sendEmail(clientEmail, code, clientName))
      }

      if (sendVia === 'sms' || sendVia === 'both') {
        if (!clientPhone) {
          throw new Error('Phone number required for SMS delivery')
        }
        promises.push(sendSMS(clientPhone, code, clientName))
      }

      // Wait for all messages to be sent
      await Promise.all(promises)

      // Log the action
      await db.collection('auditLogs').add({
        action: 'generate_client_access_code',
        userId: context.auth.uid,
        clientId,
        codeId,
        accessType,
        sendVia,
        timestamp: admin.firestore.Timestamp.now(),
        metadata: {
          userEmail: userRecord.email,
          clientName,
          clientEmail,
          clientPhone,
        },
      })

      return {
        success: true,
        code,
        message: `Access code generated and sent successfully via ${sendVia}`,
      }

    } catch (error) {
      console.error('Error in shareClientViewLink:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
)

/**
 * Firebase Function: Revoke Client View Code
 * Deactivates an existing access code
 */
export const revokeClientViewCode = functions.https.onCall(
  async (data: { codeId: string }, context): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      // Verify authentication
      if (!context.auth) {
        throw new Error('Unauthorized: User must be authenticated')
      }

      const { codeId } = data

      if (!codeId) {
        throw new Error('Missing required field: codeId')
      }

      // Get the code document
      const codeDoc = await db.collection('clientViewCodes').doc(codeId).get()
      if (!codeDoc.exists) {
        throw new Error('Access code not found')
      }

      const codeData = codeDoc.data()
      if (!codeData) {
        throw new Error('Access code data not found')
      }

      // Verify user has permission to revoke this code
      const userDoc = await db.collection('users').doc(context.auth.uid).get()
      if (!userDoc.exists) {
        throw new Error('User profile not found')
      }

      const userData = userDoc.data()
      const userRole = userData?.role || 'member'
      const userOrganizationId = userData?.organizationId

      // Get client data to verify organization access
      const clientDoc = await db.collection('clients').doc(codeData.clientId).get()
      if (!clientDoc.exists) {
        throw new Error('Client not found')
      }

      const clientData = clientDoc.data()
      if (!clientData) {
        throw new Error('Client data not found')
      }

      // Verify organization access
      if (clientData.organizationId !== userOrganizationId) {
        throw new Error('Access denied: Client belongs to different organization')
      }

      // Check if user is admin or assigned manager
      const isAdmin = userRole === 'admin' || userRole === 'owner'
      const isAssignedManager = clientData.assignedManagerId === context.auth.uid

      if (!isAdmin && !isAssignedManager) {
        throw new Error('Access denied: Only admins or assigned managers can revoke access codes')
      }

      // Deactivate the code
      await db.collection('clientViewCodes').doc(codeId).update({
        isActive: false,
        revokedAt: admin.firestore.Timestamp.now(),
        revokedBy: context.auth.uid,
      })

      // Log the action
      await db.collection('auditLogs').add({
        action: 'revoke_client_access_code',
        userId: context.auth.uid,
        clientId: codeData.clientId,
        codeId,
        timestamp: admin.firestore.Timestamp.now(),
        metadata: {
          code: codeData.code,
          accessType: codeData.accessType,
        },
      })

      return {
        success: true,
        message: 'Access code revoked successfully',
      }

    } catch (error) {
      console.error('Error in revokeClientViewCode:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
)

/**
 * Firebase Function: Validate Client View Code
 * Validates a client access code and returns client information
 */
export const validateClientViewCode = functions.https.onCall(
  async (data: { code: string }, context): Promise<{ success: boolean; client?: any; error?: string }> => {
    try {
      const { code } = data

      if (!code) {
        throw new Error('Missing required field: code')
      }

      // Find the code in Firestore
      const codeQuery = await db
        .collection('clientViewCodes')
        .where('code', '==', code.toUpperCase())
        .where('isActive', '==', true)
        .limit(1)
        .get()

      if (codeQuery.empty) {
        throw new Error('Invalid or expired access code')
      }

      const codeDoc = codeQuery.docs[0]
      const codeData = codeDoc.data()

      // Check if code has expired
      if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
        throw new Error('Access code has expired')
      }

      // Get client information
      const clientDoc = await db.collection('clients').doc(codeData.clientId).get()
      if (!clientDoc.exists) {
        throw new Error('Client not found')
      }

      const clientData = clientDoc.data()

      // Update usage statistics
      await db.collection('clientViewCodes').doc(codeDoc.id).update({
        lastUsedAt: admin.firestore.Timestamp.now(),
        usageCount: admin.firestore.FieldValue.increment(1),
      })

      // Return client information (excluding sensitive data)
      const publicClientData = {
        id: clientData.id,
        name: clientData.name,
        company: clientData.company,
        position: clientData.position,
        assignedManagerName: clientData.assignedManagerName,
        assignedManagerTitle: clientData.assignedManagerTitle,
        status: clientData.status,
        totalProjects: clientData.totalProjects,
        activeProjects: clientData.activeProjects,
        completedProjects: clientData.completedProjects,
      }

      return {
        success: true,
        client: publicClientData,
      }

    } catch (error) {
      console.error('Error in validateClientViewCode:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
) 