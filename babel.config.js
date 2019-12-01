// @ts-nocheck
function isBabelLoader(caller) {
  return caller && caller.name === "babel-loader"
}

module.exports = function(api) {
  if (api.env("test") && !api.caller(isBabelLoader)) {
    return {
      plugins: [],
      presets: [
        [
          "@babel/env",
          {
            targets: {
              node: "current"
            }
          }
        ]
      ]
    }
  }
  return {}
}
