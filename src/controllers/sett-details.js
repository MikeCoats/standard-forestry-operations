import {ReturnState} from './_base.js';

const validSettId = (settId) => {
  if (settId === undefined) {
    return false;
  }

  if (settId.trim() === '') {
    return false;
  }

  return true;
};

/**
 * Clean a string to remove any non-grid-ref characters.
 *
 * Takes something like '-NH_6400 4800__' and returns 'NH64004800'.
 *
 * @param {string} gridRef A user supplied grid ref of dubious quality.
 * @returns {string} A nice tidy version of the grid ref.
 */
const formatGridReference = (gridRef) => {
  return gridRef.toUpperCase().replace(/[^A-Z\d]/g, '');
};

/**
 * Check to see if the user supplied string looks like a grid ref.
 *
 * We first tidy up the user input, so that it's close to being a grid ref,
 * then we check that what we have left is actually a grid ref.
 *
 * @param {string} gridRef A candidate grid ref.
 * @returns {boolean} True if this looks like a valid grid ref, otherwise false.
 */
const validGridReference = (gridRef) => {
  // Check to make sure we've got some input before we go any further.
  if (gridRef === undefined) {
    return false;
  }

  // Tidy up the grid ref so that it's likely to pass validation.
  const formattedGridRef = formatGridReference(gridRef);

  // Later, we'll check that it's in the AA00000000 style, but we'll only be
  // checking for 8 or more digits, not an even number of digits, so we need
  // this one extra check.
  if (formattedGridRef.length % 2 !== 0) {
    return false;
  }

  // Check that the gridRef is in the AA00000000 format, and fail them if
  // it's not.
  return /^[A-Z]{2}\d{8,}$/g.test(formattedGridRef);
};

const validSettType = (settType) => {
  const testParse = Number.parseInt(settType, 10);
  if (Number.isNaN(testParse)) {
    return false;
  }

  if (testParse < 1) {
    return false;
  }

  if (testParse > 4) {
    return false;
  }

  return true;
};

const validEntrances = (entrances) => {
  if (entrances === undefined) {
    return false;
  }

  if (entrances.trim() === '') {
    return false;
  }

  const testParse = Number.parseInt(entrances, 10);
  if (Number.isNaN(testParse)) {
    return false;
  }

  return true;
};

const settDetailsController = (request) => {
  request.session.currentSettIdError = !validSettId(request.body.currentSettId);
  request.session.currentGridReferenceError = !validGridReference(request.body.currentGridReference);
  request.session.currentSettTypeError = !validSettType(request.body.currentSettType);
  request.session.currentEntrancesError = !validEntrances(request.body.currentEntrances);

  request.session.settDetailsError =
    request.session.currentSettIdError ||
    request.session.currentGridReferenceError ||
    request.session.currentSettTypeError ||
    request.session.currentEntrancesError;

  if (request.session.settDetailsError) {
    request.session.currentSettId = request.body.currentSettId.trim();
    request.session.currentSettType = Number.parseInt(request.body.currentSettType, 10);
    // Don't return the 'formatted' one here, just send back the original one. It's too confusing otherwise.
    request.session.currentGridReference = request.body.currentGridReference.trim();
    request.session.currentEntrances = request.body.currentEntrances;

    return ReturnState.Error;
  }

  if (request.session.currentSettIndex === -1) {
    const newSett = {
      id: request.body.currentSettId.trim(),
      type: Number.parseInt(request.body.currentSettType, 10),
      gridReference: formatGridReference(request.body.currentGridReference),
      entrances: Number.parseInt(request.body.currentEntrances, 10)
    };

    if (!Array.isArray(request.session.setts)) {
      request.session.setts = [];
    }

    request.session.setts.push(newSett);
    request.session.settCountError = false;
  } else {
    request.session.setts[request.session.currentSettIndex].id = request.body.currentSettId.trim();
    request.session.setts[request.session.currentSettIndex].type = Number.parseInt(request.body.currentSettType, 10);
    request.session.setts[request.session.currentSettIndex].gridReference = formatGridReference(
      request.body.currentGridReference
    );
    request.session.setts[request.session.currentSettIndex].entrances = Number.parseInt(
      request.body.currentEntrances,
      10
    );
  }

  return ReturnState.Positive;
};

export {settDetailsController as default};
