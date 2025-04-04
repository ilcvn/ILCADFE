import { instance } from '.';
import type { Compound } from '../models/features/compound';

export const getViewCompounds = async (): Promise<Compound> => {
  try {
    const response = await instance.post(`compound/`);
    if (response.data?.statusCode === 200 && response.data?.data) {
      return response.data?.data;
    } else {
      throw new Error('Get statistic compound for dashboard success');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message;
    throw new Error(errorMessage);
  }
};
