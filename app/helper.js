module.exports.nl2br = (str) => {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>');
};

module.exports.quote2entity = (str) => {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }
  return (str + '').replace(/"/g, '&quot;');
};

module.exports.tab2space = (str) => {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }
  return (str + '').replace(/\t/g, '  ');
};
