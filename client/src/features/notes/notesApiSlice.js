import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice"

// Setting up an entity adapter for notes with a custom sorting comparator
const notesAdapter = createEntityAdapter({
    // Sort notes based on completion status
    sortComparer: (a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
})

// Initializing the state using the notes adapter
const initialState = notesAdapter.getInitialState()

// Extending the apiSlice with specfic endpoints for notes
export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        // Endpoint for fetching notes
        getNotes: builder.query({
            query: () => '/notes',
            // Custom status validation
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            // Time to keep unused data
            keepUnusedDataFor: 5,
            // Transforming response data to fit the state structure
            transformResponse: responseData => {
                const loadedNotes = responseData.map(note => {
                    note.id = note._id
                    return note
                });
                // Set all notes in the state
                return notesAdapter.setAll(initialState, loadedNotes)
            },
            // Providing tags for cache invalidation
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Note', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Note', id }))
                    ]
                } else return [{ type: 'Note', id: 'LIST' }]
            }
        }),
        // Endpoint for adding a new note
        addNewNote: builder.mutation ({
            query: initialNote => ({
                url: '/notes',
                method: 'POST',
                body: {
                    ...initialNote,
                }
            }),
            // Tags for cache invalidation
            invalidatesTags: [
                { type: 'Note', id: "LIST"}
            ]
        }),
        // Endpoint for updating a note
        updateNote: builder.mutation({
            query: initialNote => ({
                url: '/notes',
                method: 'PATCH',
                body: {
                    ...initialNote,
                }
            }),
            // Endpoint for delete a note
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
        deleteNote: builder.mutation({
            query: ({ id }) => ({
                url: `/notes`,
                method: 'DELETE',
                body: { id }
            }),
            // Tags for cache invalidation on delete
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
    }),
})

// Exporting for extracting the query result object
export const {
    useGetNotesQuery,
    useAddNewNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
} = notesApiSlice

// Selector for extracting the query - returns the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select()

// creates memoized selector for normalized note data
const selectNotesData = createSelector(
    selectNotesResult,
    notesResult => notesResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds
    // Pass in a selector that returns the notes slice of state
} = notesAdapter.getSelectors(state => selectNotesData(state) ?? initialState)