export default function callAPIMiddleware({ dispatch, getState }) {
  return next => (action) => {
    const {
      types,
      callAPI,
      shouldCallAPI = () => true,
      payload = {}
    } = action;

    if (!types) {
      // Normal action: pass it on
      return next(action);
    }

    if (
      !Array.isArray(types) ||
      types.length !== 3 ||
      !types.every(type => typeof type === 'string')
    ) {
      throw new Error('Expected an array of three string types.');
    }

    if (typeof callAPI !== 'function') {
      throw new Error('Expected callAPI to be a function.');
    }

    if (!shouldCallAPI(getState())) {
      return undefined;
    }

    const [requestType, successType, failureType] = types;

    dispatch(Object.assign({}, payload, {
      type: requestType
    }));

    return callAPI(getState())
      .then(
        response => dispatch({
          payload: { ...response },
          type: successType
        }),
        // 处理自定义异常，比如SuccessFalseException
        error => dispatch({
          type: failureType,
          error,
          payload: {
            message: error.message
          }
        })
      ).catch(
        error => dispatch({
          type: failureType,
          error,
          payload: {
            message: error.message
          }
        })
      );
  };
}
