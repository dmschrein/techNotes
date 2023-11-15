import React from 'react'
import { useState, useEffect } from 'react'
import { useUpdateUserMutation, useDeleteUserMutation } from './usersApiSlice'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons'

const EditNoteForm = ({ id }) => {
  return (
    <div>EditNoteForm</div>
  )
}

export default EditNoteForm