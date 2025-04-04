import type HumanResourceDetail from './human-resource-detail';
import type { Pagination } from './pagination';

export default interface HumanResource {
  id: string;
  fullName: string;
  penName: string;
  imgUrl: string;
  phone: string;
  gmail: string;
  department: string;
  role: string;
  description: string;
  isShow: boolean;
  createDate: string;
  updateDate: string;
  isExist: boolean;
  language: string;
  memberDetails: HumanResourceDetail[];
}

export interface HumanResourcePagination {
  members: HumanResource[];
  pagination: Pagination;
}
