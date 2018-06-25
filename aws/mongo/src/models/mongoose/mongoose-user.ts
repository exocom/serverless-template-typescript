import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';
import {User} from '../user';
import {transformId, removeVersionKey} from '../../utils/mongoose-util';

export type UserDocument = mongoose.Document & User;

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  password: {type: String, select: false},
  passwordResetToken: String,
  passwordResetExpires: Date,

  facebook: String,
  twitter: String,
  google: String,
  tokens: Array,

  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String
  }
}, {timestamps: true});

userSchema.virtual('id').get(() => this._id);

userSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret = transformId(doc, ret, options);
    ret = removeVersionKey(doc, ret, options);
    return ret;
  }
});

userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = User.prototype.comparePassword;
userSchema.methods.gravatar = User.prototype.gravatar;

const MongooseUser = mongoose.model('User', userSchema);
export default MongooseUser;