export interface JobListing {
  id:          number
  title:       string
  company:     string
  location:    string
  category:    string
  jobType:     string
  salary:      string
  url:         string
  publishedAt: string
  description: string
  logo:        string | null
}
