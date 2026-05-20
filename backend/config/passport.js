import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/auth.model.js";
import axios from "axios";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // github se real emails fetch karo
        const { data: emails } = await axios.get(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `token ${accessToken}`,
            },
          },
        );

        // primary verified email lo
        const primaryEmailObj = emails.find(
          (email) => email.primary && email.verified,
        );

        const email = primaryEmailObj?.email;

        let user = await User.findOne({ githubId: profile.id });

        if (!user && email) {
          user = await User.findOne({ email });
        }

        if (user) {
          user.githubId = profile.id;
          user.githubAccessToken = accessToken;
          user.githubUserName = profile.username;

          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName || profile.username,
            email,
            password: "github-oauth",
            githubId: profile.id,
            githubUserName: profile.username,
            githubAccessToken: accessToken,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
export default passport;
