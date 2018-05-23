export class EventProduct {
  name: string;
  price: number;
  url: string;
  image: EventProductImage;
}

export class EventProductImage {
  sizes: string;
  src: string;
}