import createDebug from 'debug';

let storage = {
  setItem(key, value) {
    wx.setStorageSync(key, value);
  },
  getItem(key) {
    return wx.getStorageSync(key);
  },
  removeItem(key) {
    wx.removeStorageSync(key);
  }
};

// @ts-ignore
createDebug.load = function load() {
  let flag;
  try {
    flag = storage.getItem('debug');
    if (!flag && typeof process !== 'undefined') {
      flag = process.env?.DEBUG;
    }
  } catch (error) {}
  return flag;
};

// @ts-ignore
createDebug.save = function save(namespaces) {
  try {
    if (namespaces) {
      storage.setItem('debug', namespaces);
    } else {
      storage.removeItem('debug');
    }
  } catch (error) {}
};

// @ts-ignore
createDebug.enable(createDebug.load());

export default createDebug;
