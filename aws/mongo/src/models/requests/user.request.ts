import {Transform} from 'class-transformer';
import {IsEmail, IsUrl, Length, Min, ValidateNested} from 'class-validator';
import {ObjectId} from 'bson';

export class UserCreateRequest {
  @Length(5, 250)
  password: string;

  @IsEmail()
  email: string;

  @ValidateNested()
  profile: UserProfileCreateRequest;
}

export class UserProfileCreateRequest {
  name: string;
  gender: string;
  location: string;

  @IsUrl()
  website: string;

  @IsUrl()
  picture: string;
}


export class UserUpdateRequest {
  @Transform(value => ObjectId(value), {toClassOnly: true})
  id: ObjectId;

  @Length(5, 250)
  password: string;

  @IsEmail()
  email: string;
}