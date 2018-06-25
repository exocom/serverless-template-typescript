import {ObjectId} from 'bson';
import {EventProduct} from './event-product';

export class VideoEvent {
  id: ObjectId;
  startAt: number;
  endAt: number;
  url: string;
  products: Array<EventProduct>;
}