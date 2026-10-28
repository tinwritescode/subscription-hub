import { transition } from './subscription.js';

describe('transition', () => {
  it('activates a trialing subscription when the trial ends paid', () => {
    const result = transition('trialing', 'payment_succeeded');

    expect(result.unwrap()).toBe('active');
  });

  it('moves an active subscription to past_due when a renewal payment fails', () => {
    expect(transition('active', 'payment_failed').unwrap()).toBe('past_due');
  });

  it('refuses to reactivate a canceled subscription', () => {
    const result = transition('canceled', 'payment_succeeded');

    expect(result.unwrapErr()).toEqual({
      kind: 'invalid_transition',
      from: 'canceled',
      event: 'payment_succeeded',
    });
  });
});
