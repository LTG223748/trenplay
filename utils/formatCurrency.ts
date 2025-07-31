export const TC_TO_USD = 0.01;

export function formatTCWithUSD(tcAmount: number): string {
  const usd = (tcAmount * TC_TO_USD).toFixed(2);
  return `${tcAmount} TC (~$${usd})`;
}