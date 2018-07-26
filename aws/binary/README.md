## NOTES:

You must add binary types to "Settings" -> "Binary Media Types"

Example : If you want to return an mp3 simply add "audio/mpeg"

Note: You must pass Accept Header that matches EXACTLY! Otherwise it will not send the data. You can test with Postman.

Otherwise: You can add "*/*" to "Settings" -> "Binary Media Types". No longer will you have to pass a matching Accept Header. However this will not work from a Browser!

### Gotchas

If you update the "Settings" -> "Binary Media Types" manually or with a plugin, you must deploy your API to each stage before the changes will take effect on that stage.


### To Allow a browser to get your binary data (Not Recommended)

You must add "*/*" to "Settings" -> "Binary Media Types"

You must also configure a response integration via the AWS api or SDK. This can be done using the "ryanmurakami/serverless-apigwy-binary" plugin.

Note: The "ryanmurakami/serverless-apigwy-binary" plugin only adds "CONVERT_TO_BINARY" to 200 status code response. This works great for Browsers, but not if you want to return 201 status codes, etc.
