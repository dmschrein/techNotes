const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

// @desc Get all notes
// @route GET /notes
// @accesss Private 
const getAllNotes = asyncHandler(async (req, res) => {

    const notes = await Note.find().lean()

    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }
    // Add username to each note before sending the response
    // See Promise.al with map() here: https://youtu.be/4lqJBBEpjRE 
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user.username}
    }))

    res.json(notesWithUser)
})

// @desc Create new note
// @route POST /notes
// @accesss Private 
const createNewNote = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text ) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Find the user ObjectId from the username
    // const userObj = await User.findOne({ user }).lean().exec()
    // if (!userObj) {
    //     return res.status(400).json({ message: 'User not found'})
    // }
    // Use the user ObjectId to create the note
    //const userNote = userObj._id

    // Check for duplicates
    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({message: 'Duplicate note title exists' })
    }

    // Create and store new user
    const note = await Note.create({ user, title, text })

    if (note) { // created
        res.status(201).json({ message: `New note ${note.title} created` })
    } else {
        res.status(400).json({ message: 'Invalid note data received' })
    }
})


// @desc Update a note
// @route PATCH /users
// @accesss Private 
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!user || !title || !text || typeof completed !== 'boolean' ||
    typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.find(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Notes for user not found'})
    }
    // Check for duplicate
    const duplicate = await Note.findOne({ title }).lean().exec()
    // Allow updates to the original note
    if (duplicate && duplicate?._id.toString() !== id) { 
        return res.status(409).json({ message: 'Duplicate note title'})
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json({ message: `${updatedNote.title} updated` })
})


// @desc Delete a note
// @route DELETE /notes
// @accesss Private 
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID Required' })
    }

    // Does the note exist to delete?
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note ${result.title} with ID ${result._id} deleted`

    res.json(reply)

})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}