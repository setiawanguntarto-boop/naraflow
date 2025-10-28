# WABA Integration Update

## Summary
Updated the Naraflow application to integrate with official WhatsApp Business Account (WABA) API instead of the simulated verification system.

## Changes Made

### 1. ConfigurationPanel Component (`src/components/workflow/ConfigurationPanel.tsx`)
- **Removed**:
  - `whatsappNumber` state
  - `whatsappVerified` state
  - `verifying` state
  - `handleVerifyWhatsApp` function
  - `Check` icon import (unused)
  
- **Added**:
  - `phoneNumberId` state (Phone Number ID from Meta)
  - `accessToken` state (System User Access Token)
  - `wabaId` state (optional WABA ID)
  
- **Updated**:
  - Form fields replaced simulated WhatsApp number with Phone Number ID, Access Token, and WABA ID inputs
  - Validation now requires Phone Number ID and Access Token
  - Deploy button disabled state updated to check new required fields

### 2. DeployAgentModal Component (`src/components/workflow/DeployAgentModal.tsx`)
- **Removed**:
  - `whatsappNumber`, `whatsappVerified`, and `verifying` states
  - `handleVerifyWhatsApp` function
  
- **Added**:
  - `phoneNumberId`, `accessToken`, and `wabaId` states
  
- **Updated**:
  - Step 1 configuration form now uses WABA fields instead of simulated verification
  - Deployment summary displays Phone Number ID instead of WhatsApp Number
  - Validation requirements updated to include Phone Number ID and Access Token
  - `canProceedToStep2` validation updated
  - Reset logic updated for new fields
  - Fixed undefined `deploying` variable reference (changed to `isDeploying`)

### 3. DeploymentClient (`src/lib/deploymentClient.ts`)
- **Updated**:
  - `DeploymentConfig` interface: replaced `whatsappNumber` with `phoneNumberId`, `accessToken`, and `wabaId`
  - `DeploymentData` interface: replaced `whatsappNumber` with `phoneNumberId`, `accessToken`, and `wabaId`
  - `deployWorkflow` method: updated JSON body to include new WABA fields
  - `validateConfig` method: updated validation to check Phone Number ID and Access Token

### 4. useDeployment Hook (`src/hooks/useDeployment.ts`)
- No changes needed (uses updated types from DeploymentClient)

## New WABA Configuration Fields

### Required Fields
1. **Phone Number ID**: Unique ID assigned by Meta to your WhatsApp Business phone number
   - Example: `123456789012345`
   - Location: Meta Business Suite > WhatsApp > API Setup

2. **Access Token**: System User Access Token from Meta App
   - Format: `EAAJB...`
   - Type: System User Token (recommended for production)
   - Permissions: `whatsapp_business_management` and `whatsapp_business_messaging`

### Optional Fields
3. **WABA ID**: WhatsApp Business Account ID
   - Example: `102290129340398`
   - Used for account management and reference

## How to Obtain WABA Credentials

### 1. Get Test WABA and Phone Number ID
- Follow the [Get Started guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) in Facebook Developer Dashboard
- This automatically creates:
  - Business application
  - Test WABA
  - Test phone number

### 2. Generate System User Access Token
- Go to Business Settings > System Users
- Create a new system user with Admin or Employee role
- Generate token with permissions:
  - `whatsapp_business_management`
  - `whatsapp_business_messaging`

### 3. Get Phone Number ID Programmatically
```bash
curl -i -X GET "https://graph.facebook.com/<API_VERSION>/<WABA_ID>?fields=phone_numbers" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Production Checklist

To move from testing to production:

1. **Business Verification**: Complete business verification in Meta Business Suite
2. **Production Phone Number**: Switch from test number to production number via WhatsApp > API Setup in App Dashboard
3. **Webhook Configuration**: Set up webhook for receiving message notifications and delivery status
4. **Rate Limit Management**: Understand and monitor message rate limits
5. **Template Messages**: Create and get approved message templates for production use

## Benefits of Official WABA Integration

- **Real API Calls**: All API requests are made to Meta's WhatsApp Cloud API
- **Production Ready**: Direct integration with WhatsApp Business Platform
- **Scalable**: Proper token management for production environments
- **Compliant**: Follows Meta's recommended practices for WhatsApp Business accounts

## Backward Compatibility

⚠️ **Breaking Change**: This update breaks backward compatibility with the simulated verification system. Users will need to provide WABA credentials to deploy agents.

## Next Steps

Consider implementing:
1. Token refresh mechanism for long-lived tokens
2. Encrypted credential storage
3. Multiple WABA account support
4. Webhook signature verification
5. Template message management UI
