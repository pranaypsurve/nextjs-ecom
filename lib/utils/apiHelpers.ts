// API Helper utilities
// This file provides utilities for API calls and can be extended for GraphQL support in the future

/**
 * Build query parameters for REST API calls
 * @param params Object with key-value pairs
 * @returns Query string
 */
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

/**
 * Get authentication headers
 * Note: Tokens are stored in httpOnly cookies, so no manual token handling needed
 * @returns Headers object
 */
export const getAuthHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
  };
  // Cookies are sent automatically by the browser
};

/**
 * Handle API errors
 * @param error Error object
 * @returns Error message
 */
export const handleApiError = (error: any): string => {
  if (error?.data?.message) {
    return error.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

/**
 * Future: GraphQL query builder
 * This structure allows for easy migration to GraphQL
 */
export interface GraphQLConfig {
  endpoint: string;
  useQuery: boolean;
  query?: string;
  variables?: Record<string, any>;
}

// Placeholder for future GraphQL integration
export const buildGraphQLQuery = (config: GraphQLConfig): RequestInit => {
  // This will be implemented when GraphQL is added
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: config.query,
      variables: config.variables,
    }),
  };
};

