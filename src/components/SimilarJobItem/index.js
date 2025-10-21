import './index.css'

const SimilarJobItem = props => {
  const {jobDetails} = props
  const {
    companyLogoUrl,
    employmentType,
    jobDescription,
    location,
    rating,
    title,
  } = jobDetails

  return (
    <li className="similar-job-item">
      <div className="logo-title-location-container">
        <div className="logo-title-container">
          <img
            src={companyLogoUrl}
            alt="similar job company logo"
            className="company-logo"
          />
          <div className="title-rating-container">
            <h1 className="title">{title}</h1>
            <div className="rating-container">
              <p className="rating">{rating}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="job-description-container">
        <h1 className="description-heading">Description</h1>
        <p className="job-description">{jobDescription}</p>
      </div>
      <div className="location-employee-container">
        <div className="location-container">
          <p className="location">{location}</p>
        </div>
        <div className="employee-type-container">
          <p className="employee-type">{employmentType}</p>
        </div>
      </div>
    </li>
  )
}

export default SimilarJobItem
