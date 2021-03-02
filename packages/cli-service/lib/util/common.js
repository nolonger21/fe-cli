

/**
 * isType
 * @param {*} target 
 * @param {*} type  object/array/string/function/null/number
 */
const isType = (target, type) => {
  const fixType = typeof type === 'string' ? type[0].toUpperCase() + type.substr(1) : '';
  return Object.prototype.toString.call(target) === `[object ${fixType}]`;
}
  
exports.isType = isType

/**
 * getType  object/array/string/function/null/number
 * @param {*} target 
 */
const getType = target => {
  const typeString = Object.prototype.toString.call(target);
  const typeStringSplit = typeString.split(' ');
  const resultType = typeStringSplit[typeStringSplit.length - 1];
  const fixType = resultType ? resultType.substr(0, resultType.length - 1) : 'Undefined';
  return fixType.toLowerCase();
}

exports.getType = getType

/**
 *
 * @param {object|array} leftData old data
 * @param {object|array} rightData new data
 * @param {object} { keep: string, coverArray:boolean }
 * keep direction left|right
 * coverArray
 *
 */
const deepCompareDifference = (leftData, rightData, { keep = 'left', coverArray = true } = {}) => {
    const supportType = ['object', 'array'];
    const currentTYpe = getType(leftData);
    if (!supportType.includes(currentTYpe) || currentTYpe !== getType(rightData)) {
      return {};
    }
    const [left, right] = keep === 'left' ? [leftData, rightData] : [rightData, leftData];
    const res = isType(left, 'array') ? [] : {};
    Object.keys(left).forEach(key => {
      if (right[key] === undefined && left[key] !== undefined) {
        res[key] = left[key];
      } else {
        const currentKeyType = getType(left[key]);
        const isExceptionTypes = supportType.includes(currentKeyType);
        const isTypeEq = currentKeyType === getType(right[key]);
        if (isExceptionTypes) {
          // object||array
          if (isTypeEq && JSON.stringify(left[key]) !== JSON.stringify(right[key])) {
            if (coverArray && currentKeyType === 'array') {
              res[key] = right[key];
            } else {
              const compareDiff = deepCompareDifference(left[key], right[key]);
              if (Object.keys(compareDiff).length) {
                res[key] = compareDiff;
              }
            }
          }
        } else {
          if (left[key] != right[key]) {
            res[key] = right[key];
          }
        }
      }
    });
    return res;
  }


exports.deepCompareDifference = deepCompareDifference