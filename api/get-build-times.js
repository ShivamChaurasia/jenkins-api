const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const axios = require('axios')
const asyncRoute = require('../lib/asyncRoute')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(helmet())
app.use(cors())

app.get('*', asyncRoute(async (req, res) => {

  try {
    const response = await axios.get(`https://marketing:${process.env.JENKINS_KEY}@jenkins-1.adjust.com/job/company-site-v3-79d9d50114f5/api/json?tree=allBuilds[timestamp,duration]`)
    const staticBuilds = response.data.allBuilds.filter(o => o.duration > 540000 && o.duration < 3600000).map(o => ({
      timestamp: new Date(o.timestamp),
      duration: Math.round(o.duration / 60000)
    }))
    //TODO: add 7 days average
    res.status(200).json(staticBuilds)
  } catch(e) {
    console.log(e)
    res.status(500).json({ message: 'Some error occurred', errors: e })
  }
}))

module.exports = app
