import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "../config/firebase.js";

const auth = getAuth();

const FirebaseAuthController = {
  registerUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(422).json({
          email: "Email is required",
          password: "Password is required",
        });
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(auth.currentUser);
      const idToken = userCredential._tokenResponse.idToken;
      if (idToken) {
        res.cookie("access_token", idToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });

        return res.status(201).json({
          message: "Verification email sent! User created successfully!",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error in user registeration" }); //TODO: Make the error handling better.
    }
  },
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(422).json({
          email: "Email is required",
          password: "Password is required",
        });
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = userCredential._tokenResponse.idToken;

      if (idToken) {
        res.cookie("access_token", idToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });
        return res
          .status(200)
          .json({ message: "User logged in successfully", userCredential });
      } else {
        return res
          .status(500)
          .json({ error: "Internal Server Error while singing in" });
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.message || "An error occurred while singing in";
      return res.status(500).json({ error: errorMessage });
    }
  },
  logoutUser: async (req, res) => {
    try {
      await signOut(auth);
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Internal Server Error - Could not logout" });
    }
  },
};

export default FirebaseAuthController;
