import { request, type Request, type Response } from "express";
import User from "../models/User";
import { checkPasword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { transport } from "../config/nodemailer";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;
      // prevenir duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("Ya hay un usuario con ese Email");
        return res.status(409).json({ error: error.message });
      }

      const user = new User(req.body);
      user.password = await hashPassword(password);

      // Generar Token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // enviar email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Revisa tu Email para confirmarla");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no valido");
        return res.status(404).json({ error: error.message });
      }
      const user = await User.findById(tokenExist.user);
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.send("cuenta confirmada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario o la contraseña son incorrectas");
        return res.status(404).json({ error: error.message });
      }
      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        // enviar email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un email de confirmación"
        );
        return res.status(401).json({ error: error.message });
      }
      const isPasswordSucces = await checkPasword(password, user.password);
      if (!isPasswordSucces) {
        const error = new Error("El usuario o la contraseña son incorrectas");
        return res.status(401).json({ error: error.message });
      }
      const token = generateJWT({ id: user.id });
      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      // confirma si existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("No hay un usuario con ese Email");
        return res.status(404).json({ error: error.message });
      }
      if (!user.confirmed) {
        const error = new Error("El usuario ya esta confirmado");
        return res.status(403).json({ error: error.message });
      }

      // Generar Token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // enviar email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      await Promise.allSettled([user.save(), token.save()]);

      res.send("Se envio un nuevo token a tu email");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      // confirma si existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("No hay un usuario con ese Email");
        return res.status(409).json({ error: error.message });
      }

      // Generar Token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      // enviar email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send("Revisa tu email para instrucciones");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no valido");
        return res.status(404).json({ error: error.message });
      }

      res.send("Token Valido define tu contraseña");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Token no valido");
        return res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExist.user);
      user.password = await hashPassword(req.body.password);

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      res.send("El password se modifico correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };
  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist && userExist.id.toString() !== req.user.id.toString()) {
      const error = new Error("Ese email ya esta registrado");
      return res.status(409).json({ error: error.message });
    }
    req.user.name = name;
    req.user.email = email;
    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).send("Hubo un error");
    }
  };
  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;
    const user = await User.findById(req.user.id);

    const isPasswordSucces = await checkPasword(
      current_password,
      user.password
    );

    if (!isPasswordSucces) {
      const error = new Error("la contraseña actual es incorrecta");
      return res.status(401).json({ error: error.message });
    }
    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("Contraseña actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    const isPasswordSucces = await checkPasword(password, user.password);

    if (!isPasswordSucces) {
      const error = new Error("la contraseña es incorrecta");
      return res.status(401).json({ error: error.message });
    }
    res.send("contraseña correcta");
  };
}
