/** User may use app features when subscribed or on an active trial */
export function hasActiveSubscriptionAccess(
  isSubscribed?: boolean,
  isOnTrial?: boolean
): boolean {
  return isSubscribed === true || isOnTrial === true;
}

/** Logged-in user with no subscription and no active trial */
export function isRestrictedSubscriber(
  isSubscribed?: boolean,
  isOnTrial?: boolean
): boolean {
  return !hasActiveSubscriptionAccess(isSubscribed, isOnTrial);
}

export const RESTRICTED_ACTION_MESSAGE =
  "This action is accessible for subscribed users. Please subscribe or start a trial if you haven't already to continue.";
