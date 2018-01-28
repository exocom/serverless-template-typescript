import { ObjectId } from 'bson';

const headers = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  'Content-Type': 'application/json'
};

let changes = [
  {
    id: '5a1b5ae36758c40453e5e024',
    description: 'This is an example'
  },
  {
    id: '5a1b5b176758c40453e5e025',
    description: 'Of a simple mock API'
  }
];


export const getChanges = async (event, context, cb) => {
  cb(null, {
    statusCode: 200,
    body: JSON.stringify({
      data: changes
    }),
    headers
  });
};

export const postChanges = async (event, context, cb) => {
  try {
    const body = JSON.parse(event.body);
    if (!(body && body.id && body.description) || !ObjectId.isValid(body.id)) {
      cb(null, {
        statusCode: 400,
        body: JSON.stringify({
          error: {
            type: 'ApiError',
            message: 'Invalid change provided. Please provide id and description. Id must be valid BSON ObjectID.'
          }
        }),
        headers
      });
      return;
    }

    if (changes.find(c => c.id === body.id)) {
      cb(null, {
        statusCode: 409,
        body: JSON.stringify({
          error: {
            type: 'ApiError',
            message: 'A change with that Id already exits.'
          }
        }),
        headers
      });
      return;
    }

    const change = {
      id: body.id,
      description: body.description
    };

    changes.push(change);

    cb(null, {
      statusCode: 200,
      body: JSON.stringify({
        data: change
      }),
      headers
    });

  } catch (err) {
    cb(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: err && err.message || err
        }
      }),
      headers
    });
  }
};

export const getChange = async (event, context, cb) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    cb(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
        }
      }),
      headers
    });
    return;
  }

  const change = changes.find(c => c.id === event.pathParameters.changeId);
  if (!change) {
    cb(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'No change was found with the given id.'
        }
      }),
      headers
    });
    return;
  }

  cb(null, {
    statusCode: 200,
    body: JSON.stringify({
      data: change
    }),
    headers
  });
};

export const deleteChange = async (event, context, cb) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    cb(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
        }
      }),
      headers
    });
    return;
  }

  const change = changes.find(c => c.id === event.pathParameters.changeId);
  if (!change) {
    cb(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'No change was found with the given id.'
        }
      }),
      headers
    });
    return;
  }

  changes.splice(changes.indexOf(change), 1);

  cb(null, {
    statusCode: 204,
    headers
  });
};
