/**
 * Hook for showing toast messages using Shopify App Bridge
 */

export function useShopifyToast() {
  const showToast = (message: string, isError = false) => {
    // TODO: Implement using @shopify/app-bridge-react
    // This will be filled out when we build App #1
    console.log(`[Toast] ${isError ? 'ERROR' : 'INFO'}: ${message}`);
  };

  return { showToast };
}
