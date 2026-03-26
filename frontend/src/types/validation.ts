/**
 * Validation constants for form inputs
 * Centralizes all validation rules and constraints
 */

export const VALIDATION_CONSTRAINTS = {
  // Campaign validation
  CAMPAIGN: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 255,
      REQUIRED_MESSAGE: 'Campaign name is required',
      MAX_LENGTH_MESSAGE: 'Campaign name must be less than 255 characters',
    },
    SUBJECT: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 255,
      REQUIRED_MESSAGE: 'Subject is required',
      MAX_LENGTH_MESSAGE: 'Subject must be less than 255 characters',
    },
    BODY: {
      MIN_LENGTH: 10,
      REQUIRED_MESSAGE: 'Email body is required',
      MIN_LENGTH_MESSAGE: 'Email body must be at least 10 characters',
    },
    RECIPIENTS: {
      MIN_COUNT: 1,
      REQUIRED_MESSAGE: 'At least one recipient is required',
    },
  },

  // User validation
  USER: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
      MIN_LENGTH_MESSAGE: 'Name must be at least 2 characters',
      MAX_LENGTH_MESSAGE: 'Name must be less than 100 characters',
    },
    EMAIL: {
      REQUIRED_MESSAGE: 'Email is required',
      INVALID_MESSAGE: 'Invalid email address',
    },
    PASSWORD: {
      MIN_LENGTH: 6,
      MIN_LENGTH_MESSAGE: 'Password must be at least 6 characters',
    },
  },

  // Schedule validation
  SCHEDULE: {
    DATE: {
      REQUIRED_MESSAGE: 'Please select a date and time',
      FUTURE_REQUIRED_MESSAGE: 'Scheduled date must be in the future',
    },
  },
} as const;

/**
 * Validation error messages for business rules
 */
export const BUSINESS_RULE_ERRORS = {
  CAMPAIGN_ALREADY_SENT: 'Campaign has already been sent and cannot be modified',
  CAMPAIGN_SENDING: 'Campaign is currently being sent and cannot be modified',
  NO_RECIPIENTS: 'Campaign must have at least one recipient',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  UNAUTHORIZED_ACCESS: 'You do not have permission to perform this action',
} as const;
