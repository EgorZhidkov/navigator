import axios from 'axios';

export const axiosTest = (config) => {
  try {
    const data = axios.get('localhost', { params: config });
    return data;
  } catch (error) {
    return error;
  }
};
