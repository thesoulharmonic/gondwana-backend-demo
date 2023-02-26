const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// user model schema with validation

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "is required"],
    },

    email: {
      type: String,
      required: [true, "is required"],
      unique: true,
      index: true,
      validate: {
        validator: function (str) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(str);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },

    password: {
      type: String,
      required: [true, "is required"],
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    cart: {
      type: Object,
      default: {
        total: 0,
        count: 0,
      },
    },

    notifications: {
      type: Array,
      default: [],
    },

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { minimize: false }
);

// defines two methods on the schema

UserSchema.statics.findByCredentials = async function (email, password) {
  // look up a user in the database by email

  const user = await User.findOne({ email });

  // ff no user was found, show invalid credentials.

  if (!user) throw new Error("invalid credentials");
  // check password matches the user's hashed password
  const isSamePassword = bcrypt.compareSync(password, user.password);
  if (isSamePassword) return user;
  throw new Error("invalid credentials");
};

UserSchema.methods.toJSON = function () {
  //remove sensitive data from a user object
  const user = this;
  const userObject = user.toObject();
  // Convert the user object to a plain JavaScript object.
  delete userObject.password;
  return userObject;
};

//before saving => hash the password
UserSchema.pre("save", function (next) {
  // middleware function to run before saving a user object to the database
  const user = this;

  if (!user.isModified("password")) return next();

  // generate a salt to use in hashing the password
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    //hash password using the salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      //  replace the plain text password with the hashed version
      user.password = hash;
      next();
    });
  });
});

UserSchema.pre("remove", function (next) {
  this.model("Order").remove({ owner: this._id }, next);
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
