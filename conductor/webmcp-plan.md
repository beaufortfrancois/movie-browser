# WebMCP Implementation Plan

## Objective
Expose the main functionalities of the Vue movie browser application to AI agents using the WebMCP imperative API. This allows AI agents running in the browser to filter the movie list and manage the UI.

## Key Files & Context
- `src/App.vue`: The main component holding the state for filters, the movie list, and the modal.

## Implementation Steps

1. **Setup Lifecycle and Controllers**:
   - In `src/App.vue`, add an `abortController` to the component's data (or setup if using Composition API, though this uses Options API) to manage tool lifecycles.
   - Use the `mounted` lifecycle hook to register WebMCP tools via `navigator.modelContext.registerTool`.
   - Use the `unmounted` lifecycle hook to call `this.abortController.abort()` to unregister tools cleanly to avoid leaks and collisions.

2. **Register `apply-movie-filters` tool**:
   - **Tool Name**: `apply-movie-filters`
   - **Description**: "Applies filters to the movie list. Use this to sort movies or filter by minimum rating."
   - **Input Schema**:
     - `sortBy` (string, enum): `popularity.desc`, `popularity.asc`, `release_date.desc`, `release_date.asc`, `vote_average.desc`, `vote_average.asc`.
     - `minRating` (number): (0-10).
   - **Execute Function**: Update `this.filters.sortBy` and `this.filters.minRating` based on arguments, then invoke `this.applyFilters()`. Return a descriptive string confirming the action.

3. **Register `open-movie-detail-modal` tool**:
   - **Tool Name**: `open-movie-detail-modal`
   - **Description**: "Opens the movie detail modal for a specific movie currently visible in the list."
   - **Input Schema**:
     - `movieId` (number): The ID of the movie to open.
   - **Execute Function**: Find the movie object in `this.movies` matching the provided `movieId`. If found, call `this.openDetailModal(movie)` and return a confirmation string. If not found, return an error message indicating the movie ID is not in the current list.
   - **Annotations**: `{ readOnlyHint: true }`

4. **Register `close-movie-detail-modal` tool**:
   - **Tool Name**: `close-movie-detail-modal`
   - **Description**: "Closes the currently open movie detail modal."
   - **Input Schema**: empty object.
   - **Execute Function**: Call `this.closeDetailModal()` and return a confirmation string.
   - **Annotations**: `{ readOnlyHint: true }`

## Verification & Testing
- Ensure the application runs without errors.
- Run `npm run lint` and `npm run build` to verify no syntactic or compilation issues are introduced.
- **WebMCP Functional Testing**: Use Chrome DevTools MCP in a separate agent. In this agent, impersonate a browsing agent (essentially, emulate it). The browsing agent should try to successfully complete the happy paths (applying filters, opening modal, closing modal) and two error paths (e.g. invalid movieId, or closing when not open).
