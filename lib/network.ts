// lib/network.ts
export const RPC_URL = (
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
).trim();

export const TREN_MINT = (
  process.env.NEXT_PUBLIC_TREN_MINT ||              // new
  process.env.NEXT_PUBLIC_TREN_MINT_ADDRESS ||      // alias
  process.env.NEXT_PUBLIC_TRENC_MINT_ADDRESS ||     // old typo alias (with C)
  'AhgbnPg5tF2fu5ucr7x2kjqngfyKK75wtZ3tQVxAY5AC'    // devnet default
).trim();

export const ESCROW_PROGRAM_ID = (
  process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID ||
  process.env.NEXT_PUBLIC_TREN_SAFETY_PROGRAM_ID ||
  'Hd3dH635MKxrpiueyf8DkzPHLyRxtytw95cspdjyzHkd'
).trim();

export const SUBSCRIPTION_PROGRAM_ID = (
  process.env.NEXT_PUBLIC_SUBSCRIPTION_PROGRAM_ID ||
  'APTTwztgAyNriW7JV4VwPugTouwRexf7KHb6foJ7JY9N'
).trim();

export const PLATFORM_WALLET = (
  process.env.NEXT_PUBLIC_PLATFORM_WALLET || ''
).trim();



