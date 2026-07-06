import authModel from "../models/auth.model.js";
import employeesModel from "../models/employees.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

console.log("login");
// controller gets the request from the route, calls the model, and returns the response.


async function login(req, res){  console.log(req);
  try {
    const {username,password} = req.body;
    const loggedin = await authModel.findByUsername(username);
    // res.json(loggedin[0] ?? null);
    const user = loggedin[0]??null;

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
    const user_obj = {
        id:user.id,
        username:user.username,
        role:user.role,
        first_name:user.first_name,
        last_name:user.last_name,
        email:user.email
    };

    const token = jwt.sign(
      user_obj,
      process.env.JWT_SECRET,
      {expiresIn:"3h"}

    );


    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 60 * 60 * 1000
    });

    res.json({
      success:true,
      user:user_obj
    })

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function logout(req, res){
  res.clearCookie("token").json({ success: true })
}



async function changePassword(req, res){  console.log(req);
  try {
    const {user,oldPassword,password,passwordConfirm} = req.body;

    const loggedin = await authModel.findByUsername(user.username);
    // res.json(loggedin[0] ?? null);
    const checkedUser = loggedin[0]??null;

    if (!checkedUser || !checkedUser.is_active) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isValidPassword = await bcrypt.compare(
      oldPassword,
      checkedUser.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid current password"
      });
    }

    if (password!=passwordConfirm){
      return res.status(402).json({
        success: false,
        message: "Password and confirm password are not equal"
      });
    }


    if (password.length<8 || password.length>12){
      return res.status(402).json({
        success: false,
        message: "Password length should be between 8-12 alphanumeric characters"
      });
    }

    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/;
    if (!regex.test(password)){
      return res.status(402).json({
        success: false,
        message: "Password should contain at least one letter,one number and at least one special character"
      }); 
    }

    const isNewPasswordEqualToOld = await bcrypt.compare(
      password,
      checkedUser.password
    );

    if (isNewPasswordEqualToOld) {
      return res.status(401).json({
        success: false,
        message: "New password is equal to current password"
      });
    }

    await authModel.setPassword(user.id,password);

    res.json({
      success:true,
      user:user
    })

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
}



async function me(req, res){ console.log("me");
  try {
    const token = req.cookies?.token;
    if (!token){
       return res.status(401).json({
        success: false,
        user:null,
        message: "Not logged in."
      }); 
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    // drop JWT metadata (iat/exp) — return just the user fields
    const { iat, exp, ...user } = decoded;

    res.json({
      success:true,
      user:user
    })

  } catch (error) {
    // invalid or expired token — not a server error; clear the bad cookie
    res.clearCookie("token").status(401).json({
      success: false,
      user: null,
      message: "Invalid or expired session."
    });
  }
}


export default {
    login,
    logout,
    me,
    changePassword
};
