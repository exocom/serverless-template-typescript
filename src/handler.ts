const headers = {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
    "Content-Type": "application/json"
};

export const getChanges = async (event, context, cb) => {
    cb(null, {
        statusCode: 200,
        body: JSON.stringify({
          data: []
        }),
        headers
    });
};

export const getChange = async (event, context, cb) => {
  if (!event.pathParameters.changeId) {
    cb(null, {
      statusCode: 400,
      body: JSON.stringify({}),
      headers
    });
    return;
  }

  const change = [].find(c => c.id === event.pathParameters.changeId);
  if (!change) {
    cb(null, {
      statusCode: 404,
      body: JSON.stringify({}),
      headers
    });
    return;
  }


  cb(null, {
    statusCode: 200,
    body: JSON.stringify({
      data: {}
    }),
    headers
  });
};
