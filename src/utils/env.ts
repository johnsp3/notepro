/**
 * Utility functions for working with environment variables
 * This provides a central place to access environment variables and
 * provides fallbacks and validation where needed.
 */

/**
 * Get a required environment variable
 * @param name The name of the environment variable
 * @returns The value of the environment variable
 * @throws Error if the environment variable is not defined
 */
export const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    // In development, we'll throw an error to help catch missing variables
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Environment variable ${name} is required but not defined`);
    }
    // In production, we'll log a warning but return an empty string
    console.error(`Environment variable ${name} is required but not defined`);
    return '';
  }
  return value;
};

/**
 * Get an optional environment variable
 * @param name The name of the environment variable
 * @param defaultValue The default value to return if the environment variable is not defined
 * @returns The value of the environment variable or the default value
 */
export const getOptionalEnvVar = (name: string, defaultValue: string = ''): string => {
  const value = process.env[name];
  return value || defaultValue;
};

/**
 * Check if a feature flag is enabled
 * @param flagName The name of the feature flag
 * @returns True if the feature flag is enabled
 */
export const isFeatureEnabled = (flagName: string): boolean => {
  const value = getOptionalEnvVar(`REACT_APP_FEATURE_${flagName.toUpperCase()}`);
  return value === 'true' || value === '1';
}; 