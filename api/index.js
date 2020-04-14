const getDoc = async (event) => {
  return {
    statusCode: 200,
    body: "Hello World"
  }
}

module.exports = {
  getDoc
}