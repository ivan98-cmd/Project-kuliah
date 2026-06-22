import axios from 'axios';

const API_URL = '/api/rundowns';

export const fetchRundowns = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createRundown = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateRundown = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteRundown = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
