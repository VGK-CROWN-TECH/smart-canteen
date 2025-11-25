const validation = {
  isEmpty: (obj, required) => {
    const requiredItems = [];
    for (let item of required) {
      item = item.trim();
      if ((obj[item] === '' || obj[item] === undefined) && obj[item] !== 0) {
        requiredItems.push(item);
      }
    }
    return requiredItems;
  }
};

module.exports = validation;
