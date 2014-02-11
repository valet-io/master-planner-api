module.exports = {
  invalidCredentials: [{
    statusCode: 200,
    body: 'Incorrect username or password.',
  }],
  unexpectedResponse: [{
    statusCode: 200,
    body: 'Response',
  }],
  success: [{
    statusCode: 200,
    body: null,
  }]
}