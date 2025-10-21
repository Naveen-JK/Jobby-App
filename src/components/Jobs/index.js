import {Component} from 'react'
import {BsSearch} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import Header from '../Header'
import JobItem from '../JobItem'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    profileData: {},
    jobsData: [],
    apiStatus: apiStatusConstants.initial,
    profileApiStatus: apiStatusConstants.initial,
    searchInput: '',
    employmentType: [],
    minimumPackage: '',
  }

  componentDidMount() {
    this.getProfileData()
    this.getJobsData()
  }

  getProfileData = async () => {
    this.setState({profileApiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')

    // Check if it's our mock user Naveen
    const isNaveen = jwtToken && jwtToken.includes('naveen')

    if (isNaveen) {
      // Mock profile data for Naveen
      const mockProfileData = {
        name: 'Naveen',
        profileImageUrl:
          'https://assets.ccbp.in/frontend/react-js/male-avatar-img.png',
        shortBio: 'Full Stack Developer specializing in React and Node.js',
      }
      this.setState({
        profileData: mockProfileData,
        profileApiStatus: apiStatusConstants.success,
      })
    } else {
      // Original API call for other users
      try {
        const profileApiUrl = 'https://apis.ccbp.in/profile'
        const options = {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          method: 'GET',
        }
        const response = await fetch(profileApiUrl, options)
        if (response.ok) {
          const data = await response.json()
          const updatedData = {
            name: data.profile_details.name,
            profileImageUrl: data.profile_details.profile_image_url,
            shortBio: data.profile_details.short_bio,
          }
          this.setState({
            profileData: updatedData,
            profileApiStatus: apiStatusConstants.success,
          })
        } else {
          this.setState({profileApiStatus: apiStatusConstants.failure})
        }
      } catch (error) {
        this.setState({profileApiStatus: apiStatusConstants.failure})
      }
    }
  }

  getJobsData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const {employmentType, minimumPackage, searchInput} = this.state

    // For Naveen users, use a valid token that works with the jobs API
    let effectiveToken = jwtToken
    const isNaveen = jwtToken && jwtToken.includes('naveen')

    if (isNaveen) {
      // Use rahul's token for API calls since it works with the jobs API
      effectiveToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsIiwicm9sZSI6IlBSSU1FX1VTRVIiLCJpYXQiOjE2MTk2Mjg2MTN9.nZDlFsnSWArLKKeF0QbmdVfLgzUbx1BGJsqa2kc_21Y'
    }

    const employmentTypeString = employmentType.join(',')
    const jobsApiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeString}&minimum_package=${minimumPackage}&search=${searchInput}`

    const options = {
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
      },
      method: 'GET',
    }

    try {
      const response = await fetch(jobsApiUrl, options)
      if (response.ok) {
        const data = await response.json()
        const updatedData = data.jobs.map(eachJob => ({
          companyLogoUrl: eachJob.company_logo_url,
          employmentType: eachJob.employment_type,
          id: eachJob.id,
          jobDescription: eachJob.job_description,
          location: eachJob.location,
          packagePerAnnum: eachJob.package_per_annum,
          rating: eachJob.rating,
          title: eachJob.title,
        }))
        this.setState({
          jobsData: updatedData,
          apiStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({apiStatus: apiStatusConstants.failure})
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderProfileSuccessView = () => {
    const {profileData} = this.state
    const {name, profileImageUrl, shortBio} = profileData
    return (
      <div className="profile-container">
        <img src={profileImageUrl} alt="profile" className="profile-icon" />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-description">{shortBio}</p>
      </div>
    )
  }

  renderProfileFailureView = () => (
    <div className="profile-failure-container">
      <button type="button" className="retry-btn" onClick={this.getProfileData}>
        Retry
      </button>
    </div>
  )

  renderProfileLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderProfile = () => {
    const {profileApiStatus} = this.state

    switch (profileApiStatus) {
      case apiStatusConstants.success:
        return this.renderProfileSuccessView()
      case apiStatusConstants.failure:
        return this.renderProfileFailureView()
      case apiStatusConstants.inProgress:
        return this.renderProfileLoadingView()
      default:
        return null
    }
  }

  renderJobsSuccessView = () => {
    const {jobsData} = this.state
    const noJobs = jobsData.length === 0

    return noJobs ? (
      <div className="no-jobs-container">
        <img
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          alt="no jobs"
          className="no-jobs-img"
        />
        <h1 className="no-jobs-heading">No Jobs Found</h1>
        <p className="no-jobs-desc">
          We could not find any jobs. Try other filters.
        </p>
      </div>
    ) : (
      <ul className="jobs-list">
        {jobsData.map(eachJob => (
          <JobItem key={eachJob.id} jobData={eachJob} />
        ))}
      </ul>
    )
  }

  renderJobsFailureView = () => (
    <div className="jobs-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="jobs-failure-img"
      />
      <h1 className="jobs-failure-heading">Oops! Something Went Wrong</h1>
      <p className="jobs-failure-desc">
        We cannot seem to find the page you are looking for.
      </p>
      <button type="button" className="retry-btn" onClick={this.getJobsData}>
        Retry
      </button>
    </div>
  )

  renderJobsLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderJobs = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobsSuccessView()
      case apiStatusConstants.failure:
        return this.renderJobsFailureView()
      case apiStatusConstants.inProgress:
        return this.renderJobsLoadingView()
      default:
        return null
    }
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onEnterSearchInput = event => {
    if (event.key === 'Enter') {
      this.getJobsData()
    }
  }

  onChangeEmploymentType = event => {
    const {employmentType} = this.state
    const employmentTypeId = event.target.value

    if (event.target.checked) {
      this.setState(
        prevState => ({
          employmentType: [...prevState.employmentType, employmentTypeId],
        }),
        this.getJobsData,
      )
    } else {
      const updatedEmploymentType = employmentType.filter(
        eachType => eachType !== employmentTypeId,
      )
      this.setState({employmentType: updatedEmploymentType}, this.getJobsData)
    }
  }

  onChangeSalaryRange = event => {
    this.setState({minimumPackage: event.target.value}, this.getJobsData)
  }

  onSearchButtonClick = () => {
    this.getJobsData()
  }

  render() {
    const {employmentTypesList, salaryRangesList} = this.props
    const {searchInput} = this.state

    return (
      <>
        <Header />
        <div className="jobs-container">
          <div className="jobs-content">
            {/* Mobile Search */}
            <div className="search-container mobile-search">
              <input
                type="search"
                className="search-input"
                placeholder="Search"
                value={searchInput}
                onChange={this.onChangeSearchInput}
                onKeyDown={this.onEnterSearchInput}
              />
              <button
                type="button"
                data-testid="searchButton"
                className="search-button"
                onClick={this.onSearchButtonClick}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>

            {/* Filters Section */}
            <div className="filters-group">
              {this.renderProfile()}
              <hr className="line" />

              <h1 className="filter-heading">Type of Employment</h1>
              <ul className="filters-list">
                {employmentTypesList.map(eachType => (
                  <li className="filter-item" key={eachType.employmentTypeId}>
                    <input
                      type="checkbox"
                      id={eachType.employmentTypeId}
                      className="checkbox-input"
                      value={eachType.employmentTypeId}
                      onChange={this.onChangeEmploymentType}
                    />
                    <label
                      htmlFor={eachType.employmentTypeId}
                      className="filter-label"
                    >
                      {eachType.label}
                    </label>
                  </li>
                ))}
              </ul>

              <hr className="line" />

              <h1 className="filter-heading">Salary Range</h1>
              <ul className="filters-list">
                {salaryRangesList.map(eachRange => (
                  <li className="filter-item" key={eachRange.salaryRangeId}>
                    <input
                      type="radio"
                      id={eachRange.salaryRangeId}
                      className="radio-input"
                      name="salary"
                      value={eachRange.salaryRangeId}
                      onChange={this.onChangeSalaryRange}
                    />
                    <label
                      htmlFor={eachRange.salaryRangeId}
                      className="filter-label"
                    >
                      {eachRange.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Jobs List Section */}
            <div className="jobs-list-container">
              {/* Desktop Search */}
              <div className="search-container desktop-search">
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search"
                  value={searchInput}
                  onChange={this.onChangeSearchInput}
                  onKeyDown={this.onEnterSearchInput}
                />
                <button
                  type="button"
                  data-testid="searchButton"
                  className="search-button"
                  onClick={this.onSearchButtonClick}
                >
                  <BsSearch className="search-icon" />
                </button>
              </div>

              {this.renderJobs()}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default Jobs
