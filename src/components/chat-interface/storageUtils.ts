// storageUtils.ts
export const setStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const getStorage = (key: string, defaultValue: string) => {
  const item = localStorage.getItem(key);
  return item ? item : defaultValue;
};

export const removeFromStorage = (key: string) => {
  localStorage.removeItem(key);
};
