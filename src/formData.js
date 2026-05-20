import { Country } from 'country-state-city'
import { COURSE_OPTIONS, DEPARTMENTS } from '../course-options (1).ts'
import { PLACES } from '../static.ts'

const countries = Country.getAllCountries().map((country) => ({
  label: country.name,
  value: country.isoCode,
}))

const states = PLACES.map((place) => ({
  label: place.state,
  value: place.state,
  districts: place.cities.map((city) => ({
    label: city,
    value: city,
  })),
}))

export const formData = {
  countries,
  countryMap: Object.fromEntries(countries.map((country) => [country.value, country.label])),
  states,
  departments: DEPARTMENTS.map((department) => ({
    label: department,
    value: department,
  })),
  courseOptions: Object.fromEntries(
    Object.entries(COURSE_OPTIONS).map(([department, courses]) => [
      department,
      courses.map((course) => ({
        label: course,
        value: course,
      })),
    ]),
  ),
  levels: [
    { label: 'Undergraduate', value: 'undergraduate' },
    { label: 'Postgraduate', value: 'postgraduate' },
    { label: 'Diploma', value: 'diploma' },
    { label: 'Doctorate', value: 'doctorate' },
  ],
  courseTypes: [
    { label: 'Full Time', value: 'full-time' },
    { label: 'Part Time', value: 'part-time' },
    { label: 'Online', value: 'online' },
  ],
}
