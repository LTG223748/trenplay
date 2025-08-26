// /pages/api/purchaseSubscription.js
export default async function handler(req, res) {
  // Forwards to your deployed Cloud Function (if using HTTPS trigger)
  // Or, call your logic directly if running locally
  // Example (local call):
  const { purchaseSubscription } = require('../../functions/purchaseSubscription');
  return purchaseSubscription(req, res);
}
