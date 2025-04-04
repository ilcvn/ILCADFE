export enum HumanResourceRole {
  NA = 'NA',
  PRESIDENT = 'PRESIDENT',
  VICE_PRESIDENT = 'VICE_PRESIDENT',
  CHAIRPERSON = 'CHAIRPERSON',
  VICE_CHAIRMAN = 'VICE_CHAIRMAN',
  GROUP_PRESIDENT = 'GROUP_PRESIDENT',
  GROUP_VICE_PRESIDENT = 'GROUP_VICE_PRESIDENT',
  ROOM_PRESIDENT = 'ROOM_PRESIDENT',
  ROOM_VICE_PRESIDENT = 'ROOM_VICE_PRESIDENT',
  MEMBER = 'MEMBER',
}

export const HUMAN_RESOURCE_ROLES_LABEL: Record<HumanResourceRole, string> = {
  [HumanResourceRole.NA]: 'Chưa xác định',
  [HumanResourceRole.PRESIDENT]: 'Viện Trưởng',
  [HumanResourceRole.VICE_PRESIDENT]: 'Phó Viện Trưởng',
  [HumanResourceRole.CHAIRPERSON]: 'Chủ Tịch Hội Đồng',
  [HumanResourceRole.VICE_CHAIRMAN]: 'Phó Chủ Tịch Hội Đồng',
  [HumanResourceRole.GROUP_PRESIDENT]: 'Trưởng Ban',
  [HumanResourceRole.GROUP_VICE_PRESIDENT]: 'Phó Ban',
  [HumanResourceRole.ROOM_PRESIDENT]: 'Trưởng Phòng',
  [HumanResourceRole.ROOM_VICE_PRESIDENT]: 'Phó Phòng',
  [HumanResourceRole.MEMBER]: 'Thành viên Hội Đồng',
};

export const HUMAN_RESOURCE_ROLE_STYLES: Record<HumanResourceRole, string> = {
  [HumanResourceRole.NA]: 'bg-gray-100 text-gray-600',
  [HumanResourceRole.PRESIDENT]: 'bg-blue-100 text-blue-600',
  [HumanResourceRole.VICE_PRESIDENT]: 'bg-purple-100 text-purple-600',
  [HumanResourceRole.CHAIRPERSON]: 'bg-green-100 text-green-600',
  [HumanResourceRole.VICE_CHAIRMAN]: 'bg-teal-100 text-teal-600',
  [HumanResourceRole.GROUP_PRESIDENT]: 'bg-red-100 text-red-600',
  [HumanResourceRole.GROUP_VICE_PRESIDENT]: 'bg-yellow-100 text-yellow-600',
  [HumanResourceRole.ROOM_PRESIDENT]: 'bg-indigo-100 text-indigo-600',
  [HumanResourceRole.ROOM_VICE_PRESIDENT]: 'bg-pink-100 text-pink-600',
  [HumanResourceRole.MEMBER]: 'bg-orange-100 text-orange-600',
};

export enum HumanResourcePenName {
  NA = 'NA',
  BACHELOR_OF_ECONOMICS_AND_LAW = 'BACHELOR_OF_ECONOMICS_AND_LAW',
  BACHELOR_OF_ACCOUNTING = 'BACHELOR_OF_ACCOUNTING',
  LAWER = 'LAWER',
  MASTER = 'MASTER',
  DOCTORATE = 'DOCTORATE',
  ASSOCIATE = 'ASSOCIATE',
  PROFESSOR = 'PROFESSOR',
  ARBITRATOR = 'ARBITRATOR',
  JUDGE = 'JUDGE',
}

export const HUMAN_RESOURCE_PEN_NAME_LABEL: Record<HumanResourcePenName, string> = {
  [HumanResourcePenName.NA]: 'Chưa xác định',
  [HumanResourcePenName.BACHELOR_OF_ECONOMICS_AND_LAW]: 'Cử Nhân Kinh Tế Luật',
  [HumanResourcePenName.BACHELOR_OF_ACCOUNTING]: 'Cử Nhân Kế Toán',
  [HumanResourcePenName.LAWER]: 'Luật Sư',
  [HumanResourcePenName.MASTER]: 'Thạc Sĩ',
  [HumanResourcePenName.DOCTORATE]: 'Tiến Sĩ',
  [HumanResourcePenName.ASSOCIATE]: 'Phó Giáo Sư',
  [HumanResourcePenName.PROFESSOR]: 'Giáo Sư',
  [HumanResourcePenName.ARBITRATOR]: 'Trọng Tài Viên',
  [HumanResourcePenName.JUDGE]: 'Nguyên Thẩm Phán',
};
