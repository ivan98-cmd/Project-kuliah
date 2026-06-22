import axios from 'axios';

const API_URL = '/api/budgets';

export const fetchBudgets = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createBudget = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateBudget = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteBudget = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
