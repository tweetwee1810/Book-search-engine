const {GraphQLerror} = require("graphql");
const {User} = require('../models/index');
const {signToken} = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            //return the logged-in user's data if there is a user in the context then throw an error if there is no user
            if (context.user) {
                const userData = await User.findOne({_id: context.user.id})
                .populate('books');
                
                return userData;
            }
            throw new GraphQLerror ('Not logged in');
        },

    },
    Mutation: {
        //log in a user with the email and password
        login: async (parent, {email, password}) => { 
            //check if the email is correct
            const user = await User.findOne ({email});
            if (!user) {
                //throw an error if the credential are incorrect
                throw new GraphQLerror ("Email not found");
            }
            //check pw
            const correctPW = await user.isCorrectPassword(password);
            if (!correctPW) {
                throw new GraphQLerror ("Incorrect password");
            }
            //server generates a token for first time user 
            const token = signToken(user);
            return {token, User};
        },
        // add a new user by create a user and generate a token
        addUser: async (parent, {username, email, password}) => {

            const user = await User.create({username, email, password});
            const token = signToken(user);
            return {token, user};
            },
            // adds the given book to the logged-in users' saved books
        saveBook: async (parent, args, context) =>{
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate (
                    { _id: context.user._id }, 
                    { $push: {savedBooks: args.input } },
                    {new: true}
                );
                return updateUser;
            }
            throw new GraphQLerror ("you need to be logged in");
        },

        //remove the book with the given id
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate (
                    { _id: context.user._id },
                    { $pull: { savedBooks: {bookId: args.bookId } } },
                    {new: true}
                );
                return updateUser;
            }
            throw new GraphQLerror("You need to be logged in")
        },
        },

    
    };
    module.exports = resolvers;

