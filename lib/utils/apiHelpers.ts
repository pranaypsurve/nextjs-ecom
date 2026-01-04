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
 * @param token Authentication token
 * @returns Headers object
 */
export const getAuthHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
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

