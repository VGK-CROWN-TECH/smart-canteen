const responses = {
  missingParam: (fields) => {
    return {
      status: 'error',
      status_code: '203',
      message: 'invalid data',
      required_field: fields.toString()
    };
  },
  error: (code, msg) => {
    return {
      status: 'error',
      status_code: code,
      message: msg
    };
  },
  success: (msg, result = null) => {
    const res = {
      status: 'success',
      status_code: '200',
      message: msg
    };
    if (result) res['result'] = result;
    return res;
  },
  created: (msg, result = null) => {
    const res = {
      status: 'success',
      status_code: '201',
      message: msg
    };
    if (result) res['result'] = result;
    return res;
  },
  noRecord: (msg = 'No record found') => {
    return {
      status: 'error',
      status_code: '204',
      message: msg
    };
  }
};

const responseHandlers = {
  sendResponse: (res, statusCode, responseData) => {
    return res.status(statusCode).json(responseData);
  },
  sendSuccess: (res, message, result = null) => {
    return responseHandlers.sendResponse(res, 200, responses.success(message, result));
  },
  sendCreated: (res, message, result = null) => {
    return responseHandlers.sendResponse(res, 201, responses.created(message, result));
  },
  sendError: (res, statusCode, message) => {
    return responseHandlers.sendResponse(res, statusCode, responses.error(String(statusCode), message));
  },
  sendMissingParam: (res, fields) => {
    return responseHandlers.sendResponse(res, 400, responses.missingParam(fields));
  },
  sendNoRecord: (res, message = 'No record found') => {
    return responseHandlers.sendResponse(res, 404, responses.noRecord(message));
  }
};

module.exports = {
  responses,
  responseHandlers
};
