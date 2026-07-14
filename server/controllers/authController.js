import authModel from "../models/auth.model.js";
import employeesModel from "../models/employees.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { sendEmployeeActivationEmail } from "../email.js"

// controller gets the request from the route, calls the model, and returns the response.


async function login(req, res){ 
  try {
    const {username,password} = req.body;
    const loggedin = await authModel.findByUsername(username);
    // res.json(loggedin[0] ?? null);
    const user = loggedin[0]??null;

    if (!user || !user.is_active || !user.password) {
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

    res.cookie(process.env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000
    });
    try{
      await authModel.login(user.id); debugger;
    }
    catch (error) {
      console.error('Database error:', error);
    }


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
  res.clearCookie(process.env.AUTH_COOKIE_NAME).json({ success: true })
}



async function changePassword(req, res){
  try {
    const {oldPassword,password,passwordConfirm} = req.body;
    const user = req.user;
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
      return res.status(422).json({
        success: false,
        message: "Invalid current password"
      });
    }

    const err = await checkNewPassWord(checkedUser.password,password,passwordConfirm);
    if (err) return res.status(err.status).json({ success: false, message: err.message });

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

async function checkActivation(token){ 
  try {
    const activation = await authModel.findByActivationValidation(token);
    return activation[0]??null;

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getActivation(req,res){ 
  try {
    const { token } = req.params; 
    let active_token;
    
    if (!token || !(active_token = await checkActivation(token)) ) {
      return res.status(422).json({
        success: false,
        message: "Activation is not available"
      });
    }

    res.json({
      token:active_token.activation_token,
      success:true,
    })

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: "Error in activate user" });
  }
}

async function activateUser(req, res){ 
  try {
    const { token } = req.params; 
    const {password,passwordConfirm} = req.body;

    const activation = await checkActivation(token);
    if (!activation ) {
      return res.status(422).json({
        success: false,
        message: "Activation is not available"
      });
    }


    const err =   await checkNewPassWord(activation.password,password,passwordConfirm);
    if (err) return res.status(err.status).json({ success: false, message: err.message });

    await authModel.setPassword(activation.id,password);

    res.json({
      success:true,
    })

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: "Error in activate user"  });
  }
}


// forgot password: issue a reset/activation link to the employee with this email
async function forgotPassword(req, res){
  try {
    const { email } = req.params;
    const employee = await authModel.updateActivationToken(email);
    if (!employee) {
      return res.status(422).json({
        success: false,
        message: "No user with that email"
      });
    }
    await sendEmployeeActivationEmail(employee);
    res.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed activate employee.'});
  }
}


async function me(req, res){
  const cookie_name = process.env.AUTH_COOKIE_NAME;
  try {
    const token = req.cookies?.[cookie_name];
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
    res.clearCookie(cookie_name).status(401).json({
      success: false,
      user: null,
      message: "Invalid or expired session."
    });
  }
}


async function checkNewPassWord(oldPassword,password,passwordConfirm){
     if (oldPassword && await bcrypt.compare(password, oldPassword))
      return { status: 402, message: "New password is equal to current password" };
    if (password != passwordConfirm)
      return { status: 402, message: "Password and confirm password are not equal" };
    if (password.length < 8 || password.length > 12)
      return { status: 402, message: "Password length should be between 8-12 alphanumeric characters" };
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/;
    if (!regex.test(password))
      return { 
        status: 402,
        message: "Password should contain at least one letter,one number and at least one special character"
      }; 
    return null;

}

export default {
    login,
    logout,
    me,
    changePassword,
    activateUser,
    getActivation,
    forgotPassword
};
