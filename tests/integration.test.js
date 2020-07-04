'use strict'

const AWS = require('aws-sdk')
const { Client } = require('@elastic/elasticsearch')
const argv = require('minimist')(process.argv.slice(2))

const { AmazonConnection, AmazonTransport } = require('../src')

AWS.config.update({
  region: argv.region,
  profile: argv.profile
})

const client = new Client({
  node: argv.endpoint,
  Connection: AmazonConnection,
  Transport: AmazonTransport
})

client.on('response', (err, res) => {
  if (err) {
    console.error('Error:', err)
  } else {
    console.log('Request:', res.meta.request)
    console.log('Response:', res.statusCode, res.body)
  }
})

describe('AWS Elasticsearch', function () {
  this.timeout(10000)
  this.slow(1000)

  it('should be able to connect', () => {
    return client.cluster.health()
  })

  it('can clearScroll()', () => {
    return client.search({ scroll: '10s' }).then(result => {
      return client.clearScroll({
        body: {
          scroll_id: [result.body._scroll_id]
        }
      })
    })
  })

  it('handles unicode', () => {
    return client.search({
      index: '*',
      size: 0,
      body: {
        query: { query_string: { query: 'ü' } }
      }
    })
  })
})
