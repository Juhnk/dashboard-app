import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types for hook parameters and return values
interface UseHookNameOptions {
  /**
   * Optional parameter description
   */
  enabled?: boolean
  
  /**
   * Refetch interval in milliseconds
   * @default undefined
   */
  refetchInterval?: number
  
  /**
   * Callback fired when data changes
   */
  onDataChange?: (data: DataType) => void
}

interface UseHookNameReturn {
  /**
   * The current data
   */
  data: DataType | undefined
  
  /**
   * Loading state
   */
  isLoading: boolean
  
  /**
   * Error state
   */
  error: Error | null
  
  /**
   * Function to manually trigger a refetch
   */
  refetch: () => void
  
  /**
   * Function to update the data
   */
  updateData: (newData: Partial<DataType>) => Promise<void>
  
  /**
   * Function to reset to initial state
   */
  reset: () => void
}

// Replace with actual data type
interface DataType {
  id: string
  name: string
  // ... other properties
}

/**
 * Custom hook for [brief description of what the hook does].
 * 
 * @param id - The identifier for the resource
 * @param options - Configuration options for the hook
 * @returns Object containing data, loading state, and mutation functions
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const { data, isLoading, updateData } = useHookName('resource-id', {
 *     enabled: true,
 *     onDataChange: (data) => console.log('Data changed:', data)
 *   })
 * 
 *   if (isLoading) return <div>Loading...</div>
 * 
 *   return (
 *     <div>
 *       <p>{data?.name}</p>
 *       <button onClick={() => updateData({ name: 'New name' })}>
 *         Update
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useHookName(
  id: string,
  options: UseHookNameOptions = {}
): UseHookNameReturn {
  const {
    enabled = true,
    refetchInterval,
    onDataChange,
  } = options

  const queryClient = useQueryClient()

  // Query for fetching data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hook-name', id],
    queryFn: async () => {
      // Replace with actual API call
      const response = await fetch(`/api/resource/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      return response.json() as DataType
    },
    enabled: enabled && !!id,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Mutation for updating data
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<DataType>) => {
      // Replace with actual API call
      const response = await fetch(`/api/resource/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update data')
      }
      
      return response.json() as DataType
    },
    onSuccess: (updatedData) => {
      // Update the query cache
      queryClient.setQueryData(['hook-name', id], updatedData)
      
      // Call the onChange callback
      onDataChange?.(updatedData)
    },
    onError: (error) => {
      console.error('Failed to update data:', error)
    },
  })

  // Memoized update function
  const updateData = useCallback(
    async (updates: Partial<DataType>) => {
      await updateMutation.mutateAsync(updates)
    },
    [updateMutation]
  )

  // Reset function
  const reset = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['hook-name', id] })
  }, [queryClient, id])

  // Effect to call onDataChange when data changes
  useEffect(() => {
    if (data && onDataChange) {
      onDataChange(data)
    }
  }, [data, onDataChange])

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      data,
      isLoading: isLoading || updateMutation.isPending,
      error: error || updateMutation.error,
      refetch,
      updateData,
      reset,
    }),
    [data, isLoading, error, refetch, updateData, reset, updateMutation.isPending, updateMutation.error]
  )
}

// Export hook with default name
export default useHookName