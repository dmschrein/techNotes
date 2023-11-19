import React from 'react'
import { useState, useEffect } from 'react'
// Import the mutation hook for adding new notes from the notes API slice
import { useAddNewNoteMutation } from './notesApiSlice'
import { useNavigate } from 'react-router-dom'
// Import FontAwesome component and faSave icon use in this component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

// Define the NewNoteForm component accepting users as a prop (notes belong to a user)
const NewNoteForm = ({ users }) => {

    // Hook to manage the state and lifecycle of the adding a new note
    const [addNewNote, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewNoteMutation()

    // Hook to  programmatically navigate to different routes
    const navigate = useNavigate();

    // State for managing the title, text, and userId of the new note
    const [title, setTitle] = useState('')
    const [text, setText] = useState(false)
    const [userId, setUserId] = useState(users[0].id)

    // Effect to reset form and navigate when a note is successfully added
    useEffect(() => {
        if (isSuccess) {
            setTitle('')
            setText('')
            setUserId('')
            navigate('/dash/notes')
        }
    }, [isSuccess, navigate])

    // Handlers for changing title, text, and userId state
    const onTitleChanged = e => setTitle(e.target.value)
    const onTextChanged = e => setText(e.target.value)
    const onUserIdChanged = e => setUserId(e.target.value)

    // Check if the note cna be saved (fields are not empty and not loading)
    const canSave = [title, text, userId].every(Boolean) && !isLoading

    // Handler for saving a note
    const onSaveNoteClicked = async (e) => {
        e.preventDefault()
        if (canSave) {
            await addNewNote({ user: userId, title, text })
        }
    }

    // Mapping users to option elements for a dropdown
    const options = users.map(user => {
        return (
            <option 
                key={user.id}
                value={user.id}
            > {user.username}</option>
        )
    })

    // Classes for error message and validation
    const errClass = isError ? "errmsg" : "offscreen"
    const validTitleClass = !title ? "form__input--incomplete" : ''
    const validateTextClass = !text ? "form__input--incomplete" : ''

    // JSX for rendering the form 
    const content = (
        <>
            <p className={errClass}>{error?.data?.message}</p>

            <form className="form" onSubmit={onSaveNoteClicked}>
                <div className="form__title-row">
                    <h2>New Note</h2>
                    <div className="form__action-buttons">
                        <button
                            className="icon-button"
                            title="Save"
                            disabled={!canSave}
                        >
                            <FontAwesomeIcon icon={faSave} />
                            </button>
                    </div>
                </div>
                <label className="form__label" htmlFor="title">
                    Title:</label>
                <input
                    className={`form__input ${validTitleClass}`}
                    id="title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    value={title}
                    onChange={onTitleChanged} 
                />
                <label className="form__label form__checkbox-container" htmlFor="username">
                    ASSIGNED TO:</label>
                <select
                id="username"
                name="username"
                className="form__select"
                value={userId}
                onChange={onUserIdChanged} 
                >
                    {options}
                </select>
            </form>
        </>
    )
    return content
}

export default NewNoteForm