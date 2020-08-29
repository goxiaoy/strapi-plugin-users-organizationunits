//https://github.com/abpframework/abp/blob/589615d3f609bf6e8b634b60e81387d364e27d72/modules/identity/src/Volo.Abp.Identity.Domain/Volo/Abp/Identity/OrganizationUnit.cs
const codeUnitLength = 5
/**
* Creates code for given numbers.
* Example: if numbers are 4,2 then returns "00004.00002";
* @param {Array} numbers 
* @return {string}
*/
function createCode(numbers) {
    function pad(num, size) {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }
    return numbers.map((p) => pad(p, codeUnitLength)).join(".")
}
/**
 * append childCode to parentCode
 * @param {string} parentCode 
 * @param {!string} childCode 
 */
function appendCode(parentCode, childCode) {
    if (parentCode == null) {
        return childCode;
    }
    return parentCode + "." + childCode;
}
/**
 * 
 * @param {!string} code 
 * @param {string} parentCode 
 */
function getRelativeCode(code, parentCode) {
    if (parentCode == null) {
        return code;
    }
    if (parentCode.length == code.length) {
        return null;
    }
    return code.substring(parentCode.length + 1);
}
/**
 * 
 * @param {!string} code 
 */
function calculateNextCode(code) {
    const parentCode = getParentCode(code);
    const lastUnitCode = getLastUnitCode(code);
    return appendCode(parentCode, createCode([parseInt(lastUnitCode) + 1]));
}
/**
 * 
 * @param {!string} code 
 */
function getLastUnitCode(code) {
    const splitCode = code.split(".");
    return splitCode.slice(-1)[0];
}
/**
 * 
 * @param {!string} code 
 * @return {!string}
 */
function getParentCode(code) {
    var splitCode = code.split(".");
    if (splitCode.length == 1) {
        //no parent
        return null;
    }
    splitCode.pop();
    return splitCode.join(".");
}

module.exports = {
    appendCode,
    calculateNextCode,
    createCode,
    getLastUnitCode,
    getParentCode,
    getRelativeCode,
    codeUnitLength,
}