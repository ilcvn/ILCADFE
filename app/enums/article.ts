export enum ArticleType {
  TRAINING = 'TRAINING',
  SERVICE = 'SERVICE',
  NEWS = 'NEWS',
  RESEARCH = 'RESEARCH',
  ADMISSIONS = 'ADMISSIONS',
}

export const ARTICLE_TYPE_LABEL: Record<ArticleType, string> = {
  [ArticleType.TRAINING]: 'Đào Tạo',
  [ArticleType.SERVICE]: 'Dịch Vụ',
  [ArticleType.NEWS]: 'Tin Tức',
  [ArticleType.RESEARCH]: 'Nghiên Cứu Khoa Học Và Xây Dựng Pháp Luật',
  [ArticleType.ADMISSIONS]: 'Tuyển Sinh',
};

export const ARTICLE_TYPE_STYLES: Record<ArticleType, string> = {
  [ArticleType.TRAINING]: 'bg-gray-100 text-gray-600',
  [ArticleType.SERVICE]: 'bg-blue-100 text-blue-600',
  [ArticleType.NEWS]: 'bg-purple-100 text-purple-600',
  [ArticleType.RESEARCH]: 'bg-green-100 text-green-600',
  [ArticleType.ADMISSIONS]: 'bg-orange-100 text-orange-600',
};
