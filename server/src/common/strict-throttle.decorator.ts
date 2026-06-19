import { Throttle } from '@nestjs/throttler';

// Applies the "strict" throttle tier (10 req / 60s).
// Use on mutation endpoints: proposals, reviews, reports, onboarding.
export const Strict = () => Throttle({ strict: { ttl: 60_000, limit: 10 } });
