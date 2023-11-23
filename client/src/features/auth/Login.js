import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'

// Login component definition
const Login = () => {
  // useRef to manage focus on user input and on error if there is one - reference DOM elements 
  const userRef = useRef()
  const errRef = useRef()

  // useState to handle user input and error messages
  const [username, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')

  // Custom hooks for navigation and dispatching actions to Redux store
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Custom hook for login mutation (from RTK Query)
  const [login, { isLoading }] = useLoginMutation()

  // useEffect to focus on username input on component mount
  useEffect(() => {
    userRef.current.focus()
  }, [])

  // useEffect to clear error message when username or password changes
  useEffect(() => {
    setErrMsg('');
  }, [username, password])

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // get the access token after calling the login mutation hook
      const { accessToken } = await login({ username, password }).unwrap() //unwrap to use rtk query states and catch error
      dispatch(setCredentials({ accessToken })) // set accessToken
      setUserName('')
      setPassword('')
      navigate('/dash') // take user to dash after successful log in
    } catch (err) {
      if (!err.status) {
        setErrMsg('No Server Response');
      } else if (err.status === 400) {
        setErrMsg('Missing Username or Password');
      } else if (err.status === 401) {
        setErrMsg('Unauthorized');
      } else {
        setErrMsg(err.data?.message);
      }
      errRef.current.focus()
    }
  }
  // handlers
  const handleUserInput = (e) => setUserName(e.target.value)
  const handlePwdInput = (e) => setPassword(e.target.value)

  const errClass = errMsg ? "errmsg" : "offscreen"

  if (isLoading) return <p>Loading...</p>

  const content = (
    <section className="public">
      <header>
        <h1>Employee Login</h1>
      </header>
      <main className="login">
        <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            className="form__input"
            type="text"
            id="username"
            ref={userRef}
            value={username}
            onChange={handleUserInput}
            autoComplete="off"
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            className="form__input"
            type="password"
            id="password"
            onChange={handlePwdInput}
            value={password}
            required 
          />
          <button className="form__submit-button">Sign In</button>
        </form>
        </main>
        <footer>
          <Link to="/">Back to Home</Link>
        </footer>
    </section>
  )
  return content
}

export default Login