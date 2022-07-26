
const { signToken } = require('./../utils/auth');
const { AuthenticationError } = require('apollo-server-express');
const bcrypt = require("bcrypt");

const { User, DevProjects, UserProjects, Subscriptions } = require('../models');


const resolvers = {
  Query: {
    me: async (_, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
        .select('-__v -password')
        .populate('userProjects');
        return userData;
      }
      throw new AuthenticationError('Invalid Credentials');
    },
    users: async () =>  {
      return await User.find();
    },
    devProjects: async () => {
      return await DevProjects.find();
    },
    userProjects: async () => {
      return await UserProjects.find()
      .populate('user');
    },
    subs: async () => {
      return await Subscriptions.find();
    },
    user: async (_, { id }) => {
      return await User.findById(id)
      .populate('userProjects');
    },
    devProject: async (_, { id }) => {
      return await DevProjects.findById(id);
    },
    userProject: async (_, { id }) => {
      return await UserProjects.findById(id);
    },
    sub: async (_, { id }) => {
      return await Subscriptions.findById(id);
    }
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const user = await User.create(input);
      const token = signToken(user);
      return { token, user };
  },
  login: async (_, { email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError('Invalid Credentials');
    }
    const isValid = await user.isCorrectPassword(password);
    if (!isValid) {
      throw new AuthenticationError('Invalid Credentials');
    }
    const token = signToken(user);
    return { token, user };
    },
    // logged in user can update their own info
    updateUser: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const userUpdate = await User.findByIdAndUpdate(context.user._id, input, { new: true })
      return userUpdate;
    },
    updateUserPassword: async (_, { input }, context) => {
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }
         const password = await bcrypt.hash(input.password, 10);
        const userPW = await User.findByIdAndUpdate(context.user._id, 
         { $set: input, password: password }, { new: true })
         .select('-__v -password');
        return userPW;
      },
   deleteUser: async (_, { id }) => {
      return await User.findByIdAndDelete(id);
   },
   createDevProject: async (_, { input }) => {
      return await DevProjects.create(input);
   },
   updateDevProject: async (_, { id, input }) => {
      return await DevProjects.findByIdAndUpdate(id, input);
   },
   deleteDevProject: async (_, { id }) => {
      return await DevProjects.findByIdAndDelete(id);
   },
   createUserProjects: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

    const project =  await UserProjects.create(input);

    const userProject = await User.findByIdAndUpdate(context.user._id, {
      $push: { userProjects: project }}, { new: true });

    return userProject;

  },
   updateUserProjects: async (_, { id, input }) => {
      return await UserProjects.findByIdAndUpdate(id, input);
   },
   deleteUserProjects: async (_, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const user = await User.findById(context.user._id);
      const project = await UserProjects.findById(id);
      const userProjects = user.userProjects.filter(
        project => project._id.toString() !== id.toString()
      );
      await User.findByIdAndUpdate(context.user._id, { userProjects });
      return await UserProjects.findByIdAndDelete(id);
   }
   
}
};

module.exports = resolvers;