
import { useEffect, useState } from 'react'

import { useWorkOrders } from '../hooks/useWorkOrders'
import WorkOrdersTable from '../components/WorkOrdersTable'

import type {
  WorkOrderFilters,
  WorkOrderPriority,
  WorkOrderStatus,
} from '../types/work-order'

const INITIAL_FILTERS: WorkOrderFilters = {
  page: 1,
  limit: 10,
  search: '',
  status: '',
  priority: '',
}

function WorkOrdersPage() {
  const [filters, setFilters] =
    useState<WorkOrderFilters>(INITIAL_FILTERS)

  const [searchInput, setSearchInput] = useState('')

  // Debounce search input by 400 milliseconds.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {

      setFilters((previous) => ({
        ...previous,
        search: searchInput.trim(),
        page: 1,
      }))
      
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchInput])

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useWorkOrders(filters)

  const totalPages = data
    ? Math.ceil(data.pagination.total / filters.limit)
    : 0

  const updateStatus = (value: string) => {
    try {
      setFilters((previous) => ({
        ...previous,
        status: value as WorkOrderStatus | '',
        page: 1,
      }))
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const updatePriority = (value: string) => {
    try {
      setFilters((previous) => ({
        ...previous,
        priority: value as WorkOrderPriority | '',
        page: 1,
      }))
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const changePage = (newPage: number) => {
    try {
      if (newPage < 1 || newPage > totalPages) {
        return
      }

      setFilters((previous) => ({
        ...previous,
        page: newPage,
      }))
    } catch (error) {
      console.error('Failed to change page:', error)
    }
  }

  const clearFilters = () => {
    try {
      setSearchInput('')
      setFilters(INITIAL_FILTERS)
    } catch (error) {
      console.error('Failed to clear filters:', error)
    }
  }

  return (
    <main>
      <header>
        <h1>Work Orders</h1>
        <p>Manage and track your work orders.</p>
      </header>

      {/* Search and filters */}
      <section aria-label="Work order filters">
        <div>
          <label htmlFor="work-order-search">
            Search work orders
          </label>

          <input
            id="work-order-search"
            type="search"
            placeholder="Search by title..."
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="work-order-status">
            Status
          </label>

          <select
            id="work-order-status"
            value={filters.status}
            onChange={(event) =>
              updateStatus(event.target.value)
            }
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REWORK">Rework</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="work-order-priority">
            Priority
          </label>

          <select
            id="work-order-priority"
            value={filters.priority}
            onChange={(event) =>
              updatePriority(event.target.value)
            }
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <button type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </section>

      {/* Loading state */}
      {isPending && (
        <p>Loading work orders...</p>
      )}

      {/* Error state */}
      {isError && (
        <div role="alert">
          <p>
            {error instanceof Error
              ? error.message
              : 'Unable to load work orders.'}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Data state */}
      {data && (
        <>
          {isPlaceholderData && (
            <p>Updating results...</p>
          )}

          <WorkOrdersTable
            workOrders={data.data}
          />

          <p>
            Total matching work orders: {data.pagination.total}
          </p>

          {/* Pagination */}
          <nav aria-label="Work order pagination">
            <button
              type="button"
              disabled={
                filters.page <= 1 || isPlaceholderData
              }
              onClick={() =>
                changePage(filters.page - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {filters.page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={
                filters.page >= totalPages ||
                isPlaceholderData
              }
              onClick={() =>
                changePage(filters.page + 1)
              }
            >
              Next
            </button>
          </nav>
        </>
      )}
    </main>
  )
}

export default WorkOrdersPage
