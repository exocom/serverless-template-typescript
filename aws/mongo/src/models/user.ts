import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";
import {ObjectId} from 'bson';

export type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

export type AuthToken = {
  accessToken: string,
  kind: string
};

export class User {
  id: ObjectId;
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;

  facebook: string;
  tokens: AuthToken[];

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string
  };

  comparePassword: comparePasswordFunction = (candidatePassword, cb) => {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
      cb(err, isMatch);
    });
  };

  gravatar(size: number): string {
    if (!size) {
      size = 200;
    }
    if (!this.email) {
      return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
  };
}

