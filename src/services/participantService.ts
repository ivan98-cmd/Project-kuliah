import axios from 'axios';

const API_URL = '/api/participants';

export const fetchParticipants = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createParticipant = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateParticipant = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteParticipant = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
