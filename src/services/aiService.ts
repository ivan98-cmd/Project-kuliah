import axios from 'axios';

const API_URL = '/api/ai';

export const generateDescription = async (topic: string) => {
  const response = await axios.post(`${API_URL}/generate-description`, { topic });
  return response.data;
};

export const generateRundown = async (eventName: string, duration: string, keyActivities?: string) => {
  const response = await axios.post(`${API_URL}/generate-rundown`, { eventName, duration, keyActivities });
  return response.data;
};

export const getAdvisor = async (question: string, event_id?: number) => {
  const response = await axios.post(`${API_URL}/advisor`, { question, event_id });
  return response.data;
};
