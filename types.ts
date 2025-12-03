// Data Models matching the requirements

export interface Category {
  id: string;
  code: string;
  title: string;
  icon: string; // URL or Base64
}

export interface Exhibit {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  image: string; // URL or Base64
  description: string;
}

// Default/Initial data to populate the system if empty
export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', code: 'C001', title: '主要战役', icon: 'https://picsum.photos/id/1047/200/200' },
  { id: '2', code: 'C002', title: '抗战英雄', icon: 'https://picsum.photos/id/1011/200/200' },
  { id: '3', code: 'C003', title: '历史文物', icon: 'https://picsum.photos/id/1073/200/200' },
];

export const INITIAL_EXHIBITS: Exhibit[] = [
  { 
    id: '101', 
    code: 'E001', 
    name: '台儿庄战役纪念馆', 
    categoryId: '1', 
    image: 'https://picsum.photos/id/203/600/400', 
    description: '台儿庄战役是抗日战争初期中国军队取得的一次重大胜利。' 
  },
  { 
    id: '102', 
    code: 'E002', 
    name: '百团大战', 
    categoryId: '1', 
    image: 'https://picsum.photos/id/204/600/400', 
    description: '百团大战是八路军在华北地区发动的一次规模最大、持续时间最长的战略性进攻战役。' 
  },
];
