# Polar Payment Integration Setup Guide

## 🚀 Quick Setup Checklist

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Polar Payment Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token_here
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
SUCCESS_URL=https://yourdomain.com/success
POLAR_SERVER=sandbox  # Use 'production' for live payments
```

### 2. Polar Dashboard Setup

#### Create Products in Polar Dashboard:
1. Go to your [Polar Dashboard](https://polar.sh)
2. Navigate to Products section
3. Create products for each pricing tier:
   - **Starter Plan**: $20/month (or ₦33,000/month)
   - **Business Plan**: $45/month (or ₦74,250/month) 
   - **Enterprise Plan**: $120/month (or ₦198,000/month)

#### Get Product IDs:
1. After creating products, copy their IDs
2. Update `apps/client/src/lib/pricingConfig.ts`:
```typescript
export const polarProductIds: Record<string, string> = {
  'FREE': '', // Free plan doesn't need a product ID
  'Starter': 'your_actual_starter_product_id',
  'Business': 'your_actual_business_product_id', 
  'Enterprise': 'your_actual_enterprise_product_id'
}
```

### 3. Webhook Configuration

#### Set up webhook endpoint in Polar:
1. Go to Polar Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhook/polar`
3. Select events you want to receive:
   - `order.paid`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.active`
   - `refund.created`

#### Copy webhook secret:
1. After creating webhook, copy the webhook secret
2. Add it to your environment variables

### 4. Test the Integration

#### Test Checkout Flow:
1. **Start your app**: `npm run dev`
2. **Set up ngrok** (for webhook testing):
   ```bash
   npx ngrok http 3000
   ```
3. **Update webhook URL** in Polar dashboard: `https://your-ngrok-url.ngrok.io/api/webhook/polar`
4. **Test pricing page**: Go to `/pricing` and click "Subscribe Now" on any paid plan
5. **Test pricing modal**: Go to dashboard and click "Upgrade Plan" or "Manage Plan"
6. **Complete test payment** using Polar's test cards
7. **Verify success page**: Should redirect to `/success` after payment
8. **Test customer portal**: Go to `/portal` to manage billing

#### Test Customer Portal:
1. Go to `/portal` (authenticated users only)
2. Should show Polar customer portal
3. Users can manage subscriptions there

#### Test Webhook Events:
1. Check your server logs for webhook events
2. Verify webhook delivery in Polar dashboard
3. Test different payment scenarios (success, failure, refund)

### 5. Production Deployment

#### Before going live:
1. Change `POLAR_SERVER=production` in environment variables
2. Update `SUCCESS_URL` to your production domain
3. Update `returnUrl` in checkout and portal routes
4. Test with real payment methods
5. Set up proper error handling and logging

## 📁 Files Created/Modified

### New Files:
- `apps/client/src/app/checkout/route.ts` - Checkout handler
- `apps/client/src/app/portal/route.ts` - Customer portal
- `apps/client/src/app/api/webhook/polar/route.ts` - Webhook handler
- `apps/client/src/app/success/page.tsx` - Payment success page
- `apps/client/src/lib/polarUtils.ts` - Utility functions

### Modified Files:
- `apps/client/src/app/pricing/page.tsx` - Added Polar checkout integration
- `apps/client/src/components/module/PricingModal.tsx` - Updated to use Polar checkout
- `apps/client/src/components/layout/BillingSidebar.tsx` - Added customer portal link
- `apps/client/src/lib/pricingConfig.ts` - Added product ID mapping

## 🔧 Customization Options

### Checkout Customization:
- Modify `apps/client/src/app/checkout/route.ts` to customize:
  - Theme (light/dark)
  - Success/return URLs
  - Server environment

### Webhook Handling:
- Update `apps/client/src/app/api/webhook/polar/route.ts` to:
  - Update user subscription status in your database
  - Send confirmation emails
  - Trigger other business logic

### Customer Portal:
- Modify `apps/client/src/app/portal/route.ts` to:
  - Customize customer ID resolution
  - Add additional customer metadata

## 🚨 Important Notes

1. **Security**: Never commit your Polar access tokens to version control
2. **Testing**: Always test in sandbox mode before going live
3. **Webhooks**: Ensure your webhook endpoint is publicly accessible
4. **Error Handling**: Add proper error handling for failed payments
5. **Database**: Update your user/subscription tables based on webhook events

## 🆘 Troubleshooting

### Common Issues:
1. **Checkout not redirecting**: Check product IDs are correct
2. **Webhooks not firing**: Verify webhook URL is accessible
3. **Customer portal not working**: Check authentication and customer ID resolution
4. **Environment variables**: Ensure all required env vars are set

### Debug Steps:
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify Polar dashboard for webhook delivery status
4. Test with Polar's test payment methods

## 📞 Support

- [Polar Documentation](https://docs.polar.sh)
- [Polar Support](https://polar.sh/support)
- Check your Polar dashboard for transaction logs and webhook delivery status
