import axios from 'axios';
import env from './envVariable;'

const { NODE_ENV } = process.env

const instance = axios.create({
  baseURL: env[NODE_ENV].apiUrl,
});

instance.interceptors.request.use(config => config,
  (error) => {
    console.error(error);
    return Promise.reject(error);
  });

instance.interceptors.response.use(response => response, error => Promise.reject(error));

export default instance;
