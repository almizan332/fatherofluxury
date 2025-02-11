
export interface Product {
  id: number;
  title: string;
  image: string;
  dateAdded: Date;
  price: number;
}

export interface CategoryImages {
  [key: string]: string[];
}
