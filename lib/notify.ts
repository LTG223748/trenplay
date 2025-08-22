// lib/notify.ts
// Safely load the JS notify file
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notifyDefault = require('./notify');

type NotifyType = 'success' | 'error' | 'info';
type NotifyArg = string | { message: string; type?: NotifyType };

// Wrap in TS types + re-export
export const notify = (arg: NotifyArg) => notifyDefault(arg as any);
export default notifyDefault;

