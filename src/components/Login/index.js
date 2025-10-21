import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

class Login extends Component {
  state = {
    username: 'Naveen',
    password: 'Naveen@2021',
    showSubmitError: false,
    errorMsg: '',
    isSubmitting: false,
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onSubmitSuccess = jwtToken => {
    const {history} = this.props
    Cookies.set('jwt_token', jwtToken, {
      expires: 30,
      path: '/',
    })
    history.replace('/')
  }

  onSubmitFailure = errorMsg => {
    this.setState({
      showSubmitError: true,
      errorMsg,
      isSubmitting: false,
    })
  }

  // Mock authentication for Naveen
  mockAuthentication = (username, password) => {
    if (username === 'Naveen' && password === 'Naveen@2021') {
      return {
        success: true,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik5hdmVlbiIsInJvbGUiOiJQUklNRV9VU0VSIiwiaWF0IjoxNjE5NjI4NjEzfQ.mock_token_naveen_2021',
      }
    }

    if (username === 'rahul' && password === 'rahul@2021') {
      return {
        success: true,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsIiwicm9sZSI6IlBSSU1FX1VTRVIiLCJpYXQiOjE2MTk2Mjg2MTN9.nZDlFsnSWArLKKeF0QbmdVfLgzUbx1BGJsqa2kc_21Y',
      }
    }

    return {
      success: false,
      error: 'Invalid username or password',
    }
  }

  submitForm = async event => {
    event.preventDefault()
    this.setState({isSubmitting: true, showSubmitError: false})

    const {username, password} = this.state

    // First try mock authentication
    const mockAuth = this.mockAuthentication(username, password)

    if (mockAuth.success) {
      this.onSubmitSuccess(mockAuth.token)
      return
    }

    // If mock auth fails, try the original API
    const userDetails = {username, password}
    const loginApiUrl = 'https://apis.ccbp.in/login'
    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }

    try {
      const response = await fetch(loginApiUrl, options)
      const data = await response.json()

      if (response.ok) {
        this.onSubmitSuccess(data.jwt_token)
      } else {
        this.onSubmitFailure(data.error_msg || 'Something went wrong')
      }
    } catch (error) {
      this.onSubmitFailure(
        'Network error. Please check your connection and try again.',
      )
    }
  }

  renderPasswordField = () => {
    const {password, isSubmitting} = this.state
    return (
      <>
        <label className="input-label" htmlFor="password">
          PASSWORD
        </label>
        <input
          type="password"
          id="password"
          className="password-input-field"
          value={password}
          onChange={this.onChangePassword}
          placeholder="Password"
          disabled={isSubmitting}
        />
      </>
    )
  }

  renderUsernameField = () => {
    const {username, isSubmitting} = this.state
    return (
      <>
        <label className="input-label" htmlFor="username">
          USERNAME
        </label>
        <input
          type="text"
          id="username"
          className="username-input-field"
          value={username}
          onChange={this.onChangeUsername}
          placeholder="Username"
          disabled={isSubmitting}
        />
      </>
    )
  }

  render() {
    const {showSubmitError, errorMsg, isSubmitting} = this.state
    const jwtToken = Cookies.get('jwt_token')

    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }

    return (
      <div className="login-form-container">
        <form className="form-container" onSubmit={this.submitForm}>
          <div className="logo-container">
            <img
              src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
              className="login-website-logo"
              alt="website logo"
            />
          </div>
          <div className="input-container">{this.renderUsernameField()}</div>
          <div className="input-container">{this.renderPasswordField()}</div>
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          {showSubmitError && <p className="error-message">*{errorMsg}</p>}

          {/* Demo credentials info */}
          <div className="demo-credentials">
            <p className="demo-title">Demo Credentials:</p>
            <p className="demo-cred">Naveen / Naveen@2021</p>
            <p className="demo-cred">rahul / rahul@2021</p>
          </div>
        </form>
      </div>
    )
  }
}

export default Login
